

## Plan: Poruka za neulogovane korisnike na "Kontaktiraj azil"

Kada korisnik nije prijavljen i klikne na dugme "Pošalji poruku azilu" ili pokuša kontaktirati azil, prikazaće se kratka poruka sa linkom na stranicu za prijavu.

### Izmene

**`src/pages/DogDetailPage.tsx`**:
- Ispod sekcije "Kontaktiraj azil" kartice, dodati uslov: ako korisnik nije ulogovan, prikazati dugme "Pošalji poruku azilu" koje umesto slanja poruke prikazuje `Alert` komponentu sa tekstom "Morate se prijaviti da biste kontaktirali azil" i linkom ka `/auth` stranici.
- Koristiti postojeću `Alert` komponentu iz UI biblioteke ili jednostavan inline tekst sa `Link` komponentom.
- Dugme "Pozovi azil" ostaje dostupno svima (telefon je javna informacija).

### Detalji
- State `showLoginPrompt` se postavlja na `true` kada neulogovan korisnik klikne dugme.
- Prikazuje se mali tekst ispod dugmeta: "Morate biti prijavljeni da biste poslali poruku. [Prijavi se]"
- Link vodi na `/auth` stranicu.

