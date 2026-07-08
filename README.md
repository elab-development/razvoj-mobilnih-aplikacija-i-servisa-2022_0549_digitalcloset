# Digitalni Orman

Mobilna aplikacija za digitalizaciju garderobe — fotografiši svoju odeću, organizuj je po kategorijama, planiraj šta ćeš obući po danima, i dobijaj predloge autfita na osnovu trenutne vremenske prognoze.

Seminarski rad iz predmeta **Razvoj mobilnih aplikacija i servisa**.

## Opis problema i ideja aplikacije

Ljudi često imaju pun orman odeće, a svakodnevno se suočavaju sa istim problemom: "šta da obučem danas?". Digitalni Orman rešava ovaj problem tako što korisniku omogućava da:

- Fotografiše i katalogizuje svu svoju odeću na jednom mestu
- Organizuje odeću po kategorijama (Tops, Bottoms, Shoes, Dresses, Accessories) i sezonama
- Planira unapred šta će obući za određeni dan (kalendar autfita)
- Dobije automatski predlog odeće na osnovu trenutne temperature u svom gradu
- Obeleži omiljene komade odeće za brz pristup

**Ciljna grupa:** osobe koje žele bolju organizaciju garderobe i lakše planiranje svakodnevnih autfita.

## Funkcionalnosti

- Registracija, prijava i čuvanje korisničke sesije
- CRUD nad odevnim predmetima (dodavanje, pregled, izmena, brisanje) sa fotografijom
- Automatsko grupisanje odeće po kategorijama
- Označavanje omiljenih predmeta
- Planer autfita — kreiranje autfita za izabrani datum, biranje komada iz ormana
- Prikaz trenutne temperature i vremenske prognoze (na osnovu lokacije korisnika)
- Automatski predlog odeće prema trenutnoj temperaturi (sezonska logika)
- Pretraga ormana sa predlozima u realnom vremenu
- Notifikacije — potvrda uspešnih akcija i dnevni podsetnik za planiranje autfita
- Profil korisnika sa statistikom (broj odeće, autfita, omiljenih predmeta)

## 🛠️ Korišćene tehnologije

**Frontend:**

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 54)
- [Expo Router](https://docs.expo.dev/router/introduction/) fajl-bazirana navigacija
- TypeScript

**Backend / Cloud:**

- [Supabase](https://supabase.com/): PostgreSQL baza podataka, autentifikacija, Storage za slike
- Row Level Security (RLS): svaki korisnik ima pristup isključivo svojim podacima

**Native funkcionalnosti uređaja:**

- `expo-image-picker` — kamera i galerija (fotografisanje odeće)
- `expo-location` — geolokacija za vremensku prognozu
- `expo-notifications` — lokalne notifikacije i podsetnici
- [Open-Meteo API](https://open-meteo.com/) — besplatan API za vremensku prognozu

**Ostalo:**

- `@react-native-async-storage/async-storage` — čuvanje sesije i onboarding statusa
- `@react-native-community/datetimepicker` — nativni birač datuma

## Struktura projekta

digitalni-orman/
├── app/ # Ekrani aplikacije (Expo Router)
│ ├── (auth)/ # Login, Registracija
│ ├── (tabs)/ # Početna, Moj orman, Autfiti, Profil
│ ├── add-item.tsx # Dodavanje/izmena odevnog predmeta
│ ├── create-outfit.tsx # Kreiranje autfita
│ ├── item-detail.tsx # Detalji odevnog predmeta
│ ├── outfit-detail.tsx # Detalji autfita
│ ├── liked-items.tsx # Omiljeni predmeti
│ ├── onboarding.tsx # Onboarding ekran
│ └── \_layout.tsx # Root navigacija (auth/tabs logika)
├── components/ # Reusable UI komponente
├── services/ # Komunikacija sa Supabase-om (auth, clothing, outfits, storage, weather, notifications)
├── hooks/ # Custom React hooks (useAuth...)
├── contexts/ # React Context (OnboardingContext)
├── types/ # TypeScript tipovi (baza podataka)
└── assets/ # Slike, ikonice

## Instalacija i pokretanje

### Preduslovi

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) aplikacija na mobilnom telefonu (za testiranje)
- Supabase nalog i projekat (za sopstvenu bazu)

### Koraci

1. Kloniraj repozitorijum i uđi u folder:

```bash
git clone https://github.com/elab-development/razvoj-mobilnih-aplikacija-i-servisa-2022_0549_digitalcloset.git
cd digitalni-orman
```

2. Instaliraj zavisnosti:

```bash
npm install
```

3. Napravi `.env` fajl u root folderu (na osnovu `.env.example`) i popuni sopstvenim Supabase podacima:
   EXPO_PUBLIC_SUPABASE_URL=https://ujkjojpukwwvtwbtekpy.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Exh9PqtDXxiVL3SvfJ_Snw_saBYxr6M
4. Pokreni razvojni server:

```bash
npx expo start
```

5. Skeniraj QR kod Expo Go aplikacijom na telefonu.

### Baza podataka

SQL skripte za kreiranje tabela (`profiles`, `clothing_items`, `outfits`, `outfit_items`) i RLS pravila nalaze se u dokumentaciji seminarskog rada (poglavlje 2.3).

## Build (EAS)

Preview verzija aplikacije (Android `.apk`) generisana je korišćenjem Expo EAS Build sistema:

```bash
eas build --platform android --profile preview
```

Link ka build-u: `https://expo.dev/accounts/lakicevicteodora/projects/digitalni-orman/builds/17f21ac8-f445-4a7c-b82c-d3989034d57d`

## Git grane

- `main` — stabilna verzija
- `develop` — integraciona grana
- `feature/*` — pojedinačne funkcionalnosti (auth, wardrobe-crud, outfit-planner, native-features, notifications, profile-page, liked-items, splash-onboarding, app-config...)

## Autori

Teodora Lakićević 2022/0549
Danica Jovanović 2022/0178
