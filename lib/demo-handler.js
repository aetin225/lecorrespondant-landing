'use strict';
const EMAIL=/^[^\s<>@\r\n]+@[^\s<>@\r\n]+\.[^\s<>@\r\n]+$/;
const LIMITS={prenom:80,nom:80,email:254,org:150,tel:40,role:100,message:2000,website:200};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function createHandler({createTransport,env=process.env,now=Date.now,logger=console}={}){
  // Best-effort per-instance throttle; not a shared distributed quota.
  const requests=new Map();
  return async function handler(req,res){
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Méthode non autorisée.'})}
    if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return res.status(415).json({ok:false,error:'Format de demande non pris en charge.'});
    const origin=req.headers.origin;
    const allowed=new Set([env.SITE_URL,env.VERCEL_URL&&'https://'+env.VERCEL_URL,env.VERCEL_PROJECT_PRODUCTION_URL&&'https://'+env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(u=>u.replace(/\/$/,'')));
    if(!allowed.size&&req.headers.host)allowed.add((env.NODE_ENV==='production'?'https':'http')+'://'+req.headers.host);
    if(origin&&!allowed.has(origin))return res.status(403).json({ok:false,error:'Origine de la demande non autorisée.'});
    let body=req.body;if(typeof body==='string'){if(body.length>10000)return res.status(413).json({ok:false,error:'Demande trop volumineuse.'});try{body=JSON.parse(body)}catch{return res.status(400).json({ok:false,error:'Demande invalide.'})}}
    if(!body||typeof body!=='object'||Array.isArray(body))return res.status(400).json({ok:false,error:'Demande invalide.'});
    const data={};for(const [key,max]of Object.entries(LIMITS)){const value=body[key]??'';if(typeof value!=='string'||value.length>max)return res.status(400).json({ok:false,error:'Un champ est invalide ou trop long.'});data[key]=value.trim()}
    if(data.website)return res.status(200).json({ok:true});
    if(!data.prenom||!data.nom||!data.org||!EMAIL.test(data.email)||body.consent!==true||/[\r\n]/.test(data.prenom+data.nom+data.org+data.tel+data.role))return res.status(400).json({ok:false,error:'Vérifiez les champs obligatoires, votre adresse e-mail et votre accord de contact.'});
    const timestamp=now();for(const [key,item]of requests)if(item.reset<=timestamp)requests.delete(key);
    const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,80);
    const record=requests.get(ip)||{count:0,reset:timestamp+60000};
    if(record.count>=5){res.setHeader('Retry-After',String(Math.ceil((record.reset-timestamp)/1000)));return res.status(429).json({ok:false,error:'Trop de demandes. Réessayez dans une minute.'})}
    if(requests.size>=10000&&!requests.has(ip))return res.status(503).json({ok:false,error:'Service temporairement occupé. Réessayez plus tard.'});
    record.count++;requests.set(ip,record);
    const password=env.SMTP_PASS||env.SMTP_PASSWORD;const port=Number(env.SMTP_PORT||465);
    const recipients=(env.SMTP_TO||'').split(',').map(s=>s.trim()).filter(Boolean);
    if(!env.SMTP_HOST||!env.SMTP_USER||!password||!EMAIL.test(env.SMTP_FROM||'')||!recipients.length||recipients.some(s=>!EMAIL.test(s))||![465,587].includes(port))return res.status(503).json({ok:false,error:'Le formulaire est temporairement indisponible. Écrivez-nous à contact@sms-ci.net.'});
    const clean=Object.fromEntries(Object.entries(data).map(([k,v])=>[k,escapeHtml(v)]));
    const rows=[['Nom',clean.prenom+' '+clean.nom],['E-mail',clean.email],['Organisation',clean.org],['Téléphone',clean.tel||'Non renseigné'],['Fonction',clean.role||'Non renseignée'],['Message',clean.message||'Aucun message']];
    let transport;
    try{transport=createTransport({host:env.SMTP_HOST,port,secure:port===465,requireTLS:port===587,auth:{user:env.SMTP_USER,pass:password},tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:15000});
      const result=await transport.sendMail({from:{name:'LE CORRESPONDANT',address:env.SMTP_FROM},to:recipients,replyTo:data.email,subject:'Demande de démonstration — '+data.org,text:`Nouvelle demande de démonstration\n\nPrénom : ${data.prenom}\nNom : ${data.nom}\nE-mail : ${data.email}\nOrganisation : ${data.org}\nTéléphone : ${data.tel}\nFonction : ${data.role}\nMessage : ${data.message}\n\nAccord de contact : oui\nDate : ${new Date(timestamp).toISOString()}`,html:`<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#263b4e"><h1 style="font-size:23px;color:#0756a5">LE CORRESPONDANT</h1><p style="color:#c00068">Nouvelle demande de démonstration</p><table cellpadding="10" style="border-collapse:collapse">${rows.map(([label,value])=>`<tr><th style="text-align:left;vertical-align:top">${label}</th><td style="white-space:pre-wrap">${value}</td></tr>`).join('')}</table><p>Accord de contact : oui.</p></body></html>`});
      if(!result.accepted?.length)throw Error('Delivery not accepted');
      return res.status(200).json({ok:true});
    }catch(error){logger.error('Demo delivery failed:',error.code||'SMTP_ERROR');return res.status(502).json({ok:false,error:'Votre demande n’a pas pu être transmise. Écrivez à contact@sms-ci.net ou réessayez plus tard.'})}finally{transport?.close?.()}
  };
}
module.exports={createHandler};
