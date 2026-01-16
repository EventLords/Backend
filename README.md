# UNIfy Backend  
Sistem de management al evenimentelor universitare

Acesta este backend-ul aplicației **UNIfy**, o platformă care centralizează toate evenimentele universitare într-un singur loc. Scopul aplicației este să ajute studenții să descopere, să se înscrie și să primească notificări pentru evenimente, iar organizatorii și administratorii să poată gestiona și analiza activitatea din platformă.

Proiect realizat de echipa **EventLords**.


## Ce face aplicația

Backend-ul oferă un API care gestionează:

### Pentru studenți
- vizualizarea evenimentelor disponibile  
- înscrierea la evenimente  
- marcarea evenimentelor ca favorite  
- primirea de notificări  
- oferirea de feedback după participare  
- primirea de recomandări personalizate  

### Pentru organizatori
- crearea, editarea și ștergerea evenimentelor  
- vizualizarea participanților la evenimente  
- încărcarea de materiale (PDF, imagini)  
- vizualizarea feedback-ului primit  

### Pentru administratori
- validarea evenimentelor înainte de publicare  
- gestionarea conturilor de organizatori  
- generarea de rapoarte și statistici despre platformă  

## Tehnologii folosite
- NestJS (Node.js + TypeScript)  
- Prisma ORM  
- Supabase (PostgreSQL)  
- JWT pentru autentificare  
- REST API  
- Upload fișiere (PDF, imagini)  

## Baza de date (Supabase)

Aplicația folosește **Supabase** ca bază de date principală, bazată pe PostgreSQL.  
Prisma este conectat la Supabase prin variabila `DATABASE_URL`.

Supabase este folosit pentru:
- stocarea utilizatorilor, evenimentelor, înscrierilor și feedback-ului  

## Cerințe
- Node.js 18+  
- npm  
- Cont Supabase activ  

## Instalare

1. Instalează dependențele:
```bash
npm install
```

Variabile de mediu

Pentru a rula backend-ul, este necesar un fișier .env în rădăcina proiectului.

```
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="1d"
```

Configurare Prisma

Generează clientul Prisma:
```
npx prisma generate
```

Rulează migrările:
```
npx prisma migrate dev
```
Pornire aplicație
```
npm run start:dev
```




