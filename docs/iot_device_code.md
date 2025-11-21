# IoT Device Code

This file contains the C++ code intended for an ESP32 device to read sensor data, encrypt it, and send it to Firebase Realtime Database.

```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <AESLib.h>
#include <Base64.h> // pour encoder les données AES

// ====== CONFIG WIFI ======
#define WIFI_SSID "FSA-2"
#define WIFI_PASSWORD ""

// ====== CONFIG FIREBASE ======
#define API_KEY ""
#define DATABASE_URL "https://iot-cloud-project-92142-default-rtdb.europe-west1.firebasedatabase.app/" // Remplace par ton URL

// ====== CAPTEURS ======
#define DHTPIN 4
#define DHTTYPE DHT22
#define ONE_WIRE_BUS 5
#define MQ135_PIN 34
#define SAMPLE_INTERVAL 2000

// ====== OBJETS ======
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
AESLib aesLib;

// ====== CLÉ AES ======
byte aes_key[16] = {'M','a','C','l','e','S','e','c','r','e','t','e','A','E','S','1'};
byte aes_iv[16]  = {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};

// ====== FIREBASE ======
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  dht.begin();
  sensors.begin();

  // --- Connexion WiFi ---
  Serial.println("Connexion au WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\n✅ Connecté au WiFi");

  // --- Authentification Firebase ---
  auth.user.email = "";       // ton email Firebase
  auth.user.password = "";     

  // --- Configuration Firebase ---
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Optionnel : callback pour surveiller l'état du token
  config.token_status_callback = [](TokenInfo info){
    Serial.printf("Firebase token type: %d, status: %d\n", info.type, info.status);
  };

  // --- Initialisation Firebase ---
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("✅ Firebase initialisé !");
}

void loop() {
  // --- Lecture des capteurs ---
  int bpm = random(60, 110);  // Simulé
  float tempDHT = dht.readTemperature();
  float hum = dht.readHumidity();
  sensors.requestTemperatures();
  float tempDS = sensors.getTempCByIndex(0);
  int gasValue = analogRead(MQ135_PIN);

  // --- Format JSON ---
  char json[256];
  sprintf(json,
          "{\"BPM\":%d,\"TempDHT\":%.2f,\"Hum\":%.2f,\"TempDS\":%.2f,\"Gaz\":%d}",
          bpm, tempDHT, hum, tempDS, gasValue);

  // --- Chiffrement AES ---
  byte encrypted_bytes[256];
  int enc_len = aesLib.encrypt((byte*)json, strlen(json), encrypted_bytes, aes_key, 128, aes_iv);

  // --- Encodage Base64 ---
  char encrypted_base64[512];
  base64_encode(encrypted_base64, (char*)encrypted_bytes, enc_len);

  // --- Affichage console ---
  Serial.println("=== Données chiffrées (Base64) ===");
  Serial.println(encrypted_base64);

  // --- Envoi sur Firebase ---
  if (Firebase.RTDB.pushString(&fbdo, "/iot_data/data", encrypted_base64)) {
    Serial.println("✅ Données envoyées avec succès !");
  } else {
    Serial.print("❌ Erreur d’envoi : ");
    Serial.println(fbdo.errorReason());
  }

  Serial.println("----------------------------");
  delay(SAMPLE_INTERVAL);
}
```
