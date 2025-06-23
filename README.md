# 🎮 Mein Szenen-Inventar

Dies ist ein Webprojekt zum Erstellen, Speichern, Laden und Löschen von Szenen mit interaktiven Objekten.

---

## ✅ Projektübersicht

Mit diesem Tool kannst du:

- verschiedene Figuren und Objekte per Klick auf eine Zeichenfläche ziehen,
- eigene Szenen benennen und beschreiben,
- Szenen in einer MySQL-Datenbank speichern,
- gespeicherte Szenen aus einer Dropdown-Liste laden,
- Szenen aus der Datenbank löschen.

---

## 🔧 Voraussetzungen (lokal testen)

1. **XAMPP installieren**\
   [Download XAMPP](https://www.apachefriends.org/de/index.html)

2. **Folgende Dienste in XAMPP starten:**

   - ✅ Apache
   - ✅ MySQL

3. **Projektordner ins richtige Verzeichnis kopieren:** Den gesamten Ordner `szenenprojekt` nach:

   ```plaintext
   C:\xampp\htdocs\szenenprojekt
   ```

---

## 🌐 Projekt starten

1. **Browser öffnen**
2. Gehe auf:
   ```
   http://localhost/szenenprojekt/index.html
   ```

---

## 📦 Projektstruktur

```plaintext
szenenprojekt/
│
├── index.html             ← Hauptseite
├── java.js                ← Alle Skripte (Speichern, Laden, Löschen)
├── modern.css             ← Layout / Farbstil
├── mystyling.css          ← Zusatz-Styles
│
├── save.php               ← Szene speichern
├── load.php               ← Szenen laden
├── delete.php             ← Szene löschen
├── create_table.sql       ← SQL zum Anlegen der Datenbanktabelle
│
├── images/                ← Bilder/Icons
└── README.md              ← Diese Datei
```

---

## 📃 Datenbank einrichten

1. Gehe auf:

   ```
   http://localhost/phpmyadmin
   ```

2. Erstelle eine neue Datenbank namens:

   ```
   szenen
   ```

3. Klicke auf **„SQL“** und füge folgenden Befehl ein:

```sql
CREATE TABLE `szenen_data` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `info` TEXT,
  `objekte` TEXT,
  PRIMARY KEY (`id`)
);
```

Dann auf „OK“ klicken.

---

## ✨ Funktionen testen

### ✅ Szene speichern

- Name + Info eingeben
- Objekte hinzufügen
- Button **„Szene speichern“** klicken

🔍 In Chrome DevTools (F12 → Network-Tab) sollte ein `save.php`-POST-Request auftauchen.

### ✅ Szene laden

- Wird automatisch beim Start geladen
- Szenen erscheinen links im Menü

### ✅ Szene löschen

- Rechtsklick auf Szene im Menü
- „Szene löschen“ auswählen
- Szene wird aus Datenbank gelöscht

---

## 🧪 Fehlerbehebung

- **{"status":"error"} bei **`` → Wahrscheinlich leerer POST-Body oder falscher Dateipfad\
  → Konsole im Browser (F12 → Console) prüfen

- ``** zeigt „Not Found“** → Liegt dein Projektordner wirklich unter `htdocs`?

- **Daten erscheinen nicht in phpMyAdmin** → Tabelle richtig angelegt? Datenbankname korrekt?



Falls etwas nicht funktioniert:

- Konsolen-Fehler ansehen (Browser F12 → „Console“ / „Network“)
- PHP-Dateien in `htdocs` prüfen
- Apache und MySQL wirklich gestartet?

---

Viel Erfolg! 

