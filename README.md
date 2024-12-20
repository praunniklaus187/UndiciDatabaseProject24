# **DatenbankenUndici**

### **Autoren**
- Gregory von Werne
- Samuel Widmer
- Niklaus von Praun


## **Verzeichnisstruktur**
```
src/               
├── controllers/   # Enthält die Controller-Logik für verschiedene Funktionen
│   ├── adminController.js      # Steuert die Funktionen für Administratoren
│   ├── customerController.js   # Beinhaltet die Logik für Kundeninteraktionen
│   ├── employeeController.js   # Verwaltet die Funktionen für Mitarbeiter
│   ├── orderController.js      # Bearbeitet die Bestellvorgänge
│   ├── productsController.js   # Zuständig für die Verwaltung von Produkten
│   └── storageController.js    # Enthält die Logik für Lagerverwaltungsaufgaben
├── models/        # Beinhaltet die Datenbankmodelle; jegliche SQL Abfragen in Methoden
│   ├── adminModel.js        # Modell für die Administrator-Daten
│   ├── customerModel.js     # Modell für Kundeninformationen
│   ├── employeeModel.js     # Modell für Mitarbeiterdaten
│   ├── orderModel.js        # Modell für Bestelldaten
│   └── storageModel.js      # Modell für Lagerdaten
├── public/            # Verzeichnis für statische Dateien wie CSS und JavaScript
│   ├── css/           # Enthält die CSS-Stylesheets
│   │   ├── adminDashboard.css  # Stylesheet für das Admin-Dashboard
│   │   └── global.css          # Globale CSS-Styles
│   └── js/            # Enthält clientseitige JavaScript-Dateien
│       ├── adminDashboard.js   # Admin-Dashboard-Funktionen
│       ├── adminStorage.js     # Funktionen für die Lagerverwaltung
│       ├── dashboard.js        # Allgemeine Dashboard-Logik
│       ├── navigate.js         # Navigation und Routing-Logik
│       ├── order.js            # Logik für Bestellvorgänge
│       ├── signup.js           # Logik für die Benutzerregistrierung
│       └── storage.js          # Lagerverwaltungsfunktionen
├── routes/            # Definiert die Routen der Anwendung
│   ├── adminRoutes.js             # Routen für Admin-Funktionen
│   ├── adminStorageRoute.js       # Routen für die Lagerverwaltung
│   ├── customerRoutes.js          # Routen für Kundeninteraktionen
│   ├── employeeDashboardRoutes.js # Routen für das Mitarbeiter-Dashboard
│   ├── employeeRoutes.js          # Routen für Mitarbeiter
│   ├── employeeStorageRoute.js    # Routen für die Lagerverwaltung durch Mitarbeiter
│   ├── orderRoutes.js             # Routen für Bestellungen
│   └── productsRoutes.js          # Routen für Produkte
├── views/             # Beinhaltet die Ansichten der Benutzeroberfläche
│   ├── admin.html                # Admin-Dashboard-Ansicht
│   ├── adminStorage.html         # Lagerverwaltung für Admins
│   ├── employee.html             # Mitarbeiter-Dashboard
│   ├── employeeDashboard.html    # Detailliertes Mitarbeiter-Dashboard
│   ├── order.html                # Ansicht für Bestellungen
│   ├── root.html                 # Startseite der Anwendung
│   ├── signup.html               # Registrierungsseite
│   └── storage.html              # Lagerverwaltungsseite
├── app.js             # Der Einstiegspunkt der Anwendung
└── db.js              # Enthält die Datenbankverbindung und Konfigurationsdetails

```


## **Installation**

### **Schritte zur Installation:**

1. **In das Projektverzeichnis wechseln**  
   ```bash
   cd DatenbankenUndici
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

---

## **Nutzung**

1. **Server starten**
   ```bash
   node app.js
   ```

2. **Im Browser öffnen**  
   Gehe zu [http://localhost:3000](http://localhost:3000), um die Anwendung zu nutzen.

---

## **Projektbeschreibung**

Das Projekt **Datenbanken Undici** implementiert eine Datenbank-gestützte Anwendung mit folgenden Kernfunktionen:

- Verwaltung von Administratoren, Kunden und Mitarbeitern.
- Lager- und Produktmanagement.
- Bestell- und Transaktionsverarbeitung.

---

### **Features:**
- **Controller:** Steuern die Logik für unterschiedliche Benutzerrollen und Funktionalitäten.
- **Modelle:** Repräsentieren die Datenbankstrukturen und bieten Schnittstellen für den Datenzugriff.
- **Public Directory:** Beinhaltet alle statischen Ressourcen wie CSS- und JavaScript-Dateien.
- **Views:** Beinhalted jegliche HTML files zur Frontend Ansicht

---

### **Employee Login:**
- **Admin:** EMPLOYEE_ID: EMP001; Passwort: secret123
- **Employee ohne Admin Status:** Employee_ID: EMP002; Passwort: pass456
---
