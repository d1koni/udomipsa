

# Plan: Blog + Poruke + Admin sistem

## 1. Admin uloga - Bezbednost

Administratorska uloga se nikada ne moze odabrati pri registraciji. Samo postojeci admin moze dodeliti admin ulogu drugom korisniku.

### Pristup
- Dodati vrednost `admin` u `app_role` enum
- Korisnici pri registraciji mogu birati samo `adopter` ili `shelter` (kao i do sada)
- Kreirati edge function `manage-admin` koju samo admini mogu pozvati da dodele/uklone admin ulogu
- Za prvog admina: nakon sto se registrujete sa svojim nalogom, pokrenut cemo SQL migraciju koja ce vasem korisniku dodeliti admin ulogu direktno u bazi

### Admin panel
- Stranica `/blog/admin` dostupna samo korisnicima sa admin ulogom
- Navigacija prikazuje "Blog Admin" link samo za admine

---

## 2. Baza podataka - Migracija

Jedna SQL migracija koja obuhvata sve promene:

```text
1. ALTER TYPE public.app_role ADD VALUE 'admin'

2. CREATE TABLE public.blog_posts
   - id (UUID, PK)
   - title (TEXT, NOT NULL)
   - content (TEXT, NOT NULL)  
   - image_url (TEXT, nullable)
   - author_id (UUID, NOT NULL)
   - created_at, updated_at (TIMESTAMPTZ)
   - RLS: svi mogu citati, samo admin moze INSERT/UPDATE/DELETE

3. CREATE TABLE public.conversations
   - id (UUID, PK)
   - adopter_id (UUID, NOT NULL)
   - shelter_id (UUID, NOT NULL)
   - dog_id (UUID, REFERENCES dogs, nullable)
   - created_at (TIMESTAMPTZ)
   - RLS: korisnici vide samo svoje konverzacije
   - UNIQUE(adopter_id, shelter_id, dog_id)

4. CREATE TABLE public.messages
   - id (UUID, PK)
   - conversation_id (UUID, REFERENCES conversations)
   - sender_id (UUID, NOT NULL)
   - content (TEXT, NOT NULL)
   - is_read (BOOLEAN, DEFAULT false)
   - created_at (TIMESTAMPTZ)
   - RLS: korisnici vide samo poruke iz svojih konverzacija
   - Realtime omogucen

5. Azurirati has_role funkciju da podrzi novu 'admin' vrednost (vec radi automatski jer koristi enum)
```

---

## 3. Edge Function: manage-admin

- Putanja: `manage-admin`
- Metod: POST
- Telo: `{ user_email: string, action: "grant" | "revoke" }`
- Provera: pozivalac mora imati admin ulogu (provera preko service role key-a)
- Funkcija pronalazi korisnika po email-u i dodaje/uklanja admin ulogu

---

## 4. Blog sistem

### Nove datoteke
- `src/pages/BlogPage.tsx` - javna lista blog postova sa karticama (slika, naslov, datum, kratak opis)
- `src/pages/BlogPostPage.tsx` - detaljna stranica jednog posta
- `src/pages/BlogAdminPage.tsx` - admin panel za upravljanje postovima (CRUD)
- `src/components/BlogCard.tsx` - komponenta kartice za blog post

### Funkcionalnost
- Svi korisnici (i neulogovani) mogu citati blog postove
- Samo admin moze kreirati, menjati i brisati postove
- Admin panel ima formu za dodavanje posta (naslov, sadrzaj, slika)
- Admin panel ima listu postova sa opcijama za izmenu i brisanje

---

## 5. Sistem za poruke

### Nove datoteke
- `src/pages/MessagesPage.tsx` - lista konverzacija + chat prozor
- `src/components/ChatWindow.tsx` - komponenta za prikaz poruka i slanje novih

### Funkcionalnost
- Na profilu psa, dugme "Kontaktiraj Azil" kreira ili otvara konverzaciju izmedju udomitelja i azila (vezano za konkretnog psa)
- Stranica `/poruke` prikazuje sve konverzacije korisnika
- Svaka konverzacija prikazuje ime psa i drugu stranu
- Realtime azuriranje poruka koristeci Supabase Realtime
- Indikator neprocitanih poruka u navigaciji

---

## 6. Izmene postojecih datoteka

### `src/App.tsx`
- Nove rute: `/blog`, `/blog/:id`, `/blog/admin`, `/poruke`

### `src/components/Navbar.tsx`
- Novi linkovi: "Blog" (vidljiv svima), "Poruke" (za ulogovane), "Blog Admin" (samo za admin)
- Badge za neprocitane poruke

### `src/pages/DogDetailPage.tsx`
- Dugme "Kontaktiraj Azil" pokrece kreiranje konverzacije i preusmerava na `/poruke`

### `src/contexts/AuthContext.tsx`
- Podrska za `admin` ulogu (vec radi jer koristi enum iz baze)

---

## 7. Postavljanje prvog admina

Nakon sto se registrujete sa svojim nalogom:
1. Pokrenucemo SQL upit koji dodaje `admin` ulogu vasem korisniku u `user_roles` tabelu
2. Od tog momenta mozete koristiti edge function ili admin panel da dodelite admin ulogu drugima

---

## 8. Redosled implementacije

1. SQL migracija (enum + tabele + RLS)
2. Edge function za upravljanje admin ulogom
3. Blog sistem (stranice + admin panel)
4. Sistem za poruke (konverzacije + realtime)
5. Azuriranje navigacije i postojecih stranica
6. Postavljanje prvog admina (nakon vase registracije)

