# ThermalGuard: Extreme Heatwave Early Warning & Human Thermal Stress Index Platform

**ThermalGuard** is a GIS-based early warning and public health defense platform built to safeguard Indian urban populations against extreme heatwaves. It translates meteorological variables into physiological human thermal stress metrics and forecasts health outcomes (hospitalizations, emergency room surges, and heat-related illness) with a 3–5 day lead time.

---

## 🌟 Proposed Solution & Key Innovations

### 1. Physiology-First, Ward-Level Risk
Alerts trigger on true human heat stress rather than dry-bulb air temperature alone:
- **WBGT (Wet Bulb Globe Temperature)**: Combines Stull (2011) psychrometric wet bulb ($T_w$), Liljegren black-globe radiative equilibrium ($T_g$), and Magnus-Tetens dew point ($T_d$):
  $$WBGT_{outdoor} = 0.7 T_w + 0.2 T_g + 0.1 T_d$$
- **UTCI (Universal Thermal Climate Index)**: Multi-node dynamic human thermal comfort polynomial modeling metabolic heat dissipation, solar radiation flux, and wind convection.
- **NOAA / Steadman Heat Index**: Rothfusz regression equation.
- **Excess Heat Factor (EHF)**: Excess Heat Indices comparing 3-day trailing mean against the 95th historical percentile ($EHI_{sig}$) and the past 30 days ($EHI_{accl}$).
- **Ward-Level Socioeconomic Vulnerability Weighting**:
  $$\text{Vulnerability} = 0.30 \times \text{Elderly/Children \%} + 0.35 \times \text{Outdoor Workers \%} + 0.25 \times \text{Informal/Slum Housing \%} + 0.10 \times \text{NDVI Canopy Deficiency}$$

### 2. Pan-India Municipal Coverage (11 Key Metropolitan Regions & 26 Wards)
- **North Heat Plains**: Delhi NCR (Central, Chandni Chowk, Okhla, Rohini), Lucknow (Old City, Gomti Nagar)
- **Western Arid & Coastal**: Ahmedabad (Danilimda Slum, Odhav, Navrangpura), Mumbai (Dharavi, Bandra, Chembur)
- **Central Vidarbha Extreme Heat**: Nagpur (Sitabuldi, Hingna MIDC), Bhopal (Old City)
- **North-West Semi-Arid / Desert Fringe**: Jaipur (Pink City Heritage, Sanganer)
- **Eastern Deltaic & Coastal**: Kolkata (Burrabazar, Salt Lake, Topsia), Bhubaneswar (Old Town, Patia Infocity)
- **Southern Coromandel & Deccan Plateau**: Hyderabad (Charminar, Hitec City), Chennai (North Chennai Port, T. Nagar)

### 3. Health-Outcome Forecasting (3–5 Days Lead Time)
- Integrates historical ERA5 reanalysis and IMD-NCDC Heat-Related Illness (HRI) surveillance data to predict emergency department hospital surges (+10% to +180%) days before the heat peaks.
- Displays full 24-hour diurnal heat curves (Dry Bulb Temp vs. WBGT vs. Solar Irradiance).

### 4. Targeted Multi-Channel Ward-Level Alerts & Telephony Integration
- **Live Production & Simulation Toggle**: Safe sandbox testing or live outbound carrier delivery.
- **WhatsApp Business API**: Rich interactive templates with immediate action guidance and "Find Nearest Cooling Center" buttons.
- **Twilio SMS / Fast2SMS**: Indian DLT and TRAI-compliant SMS with flash alert capabilities.
- **NDMA SACHET Gateway**: OASIS Common Alerting Protocol (CAP v1.2) XML compliant output.

### 5. Role-Specific Action Portals
Guideline-based preventative protocols tailored for:
1. **General Citizens & Vulnerable Households**: Hydration schedule, indoor cooling, elderly checks.
2. **ASHA & Community Healthcare Workers**: Door-to-door triage protocols, ORS and zinc packet distribution, high-risk maternal/elderly check register.
3. **Employers & Outdoor Labor / Gig Delivery**: ISO 7243 WBGT work-rest intervals (e.g. 45m work/15m rest at WBGT 29–31°C; 15m work/45m rest at 31–32°C; mandatory work stoppage >32°C).
4. **Hospitals & Emergency Health Facilities**: Heat stroke cold water immersion bath readiness, cold saline supplies, ER surge staffing alerts.
5. **Municipal Authorities & Power Discoms**: GIS cooling center locations, misting tanker deployments, transformer thermal overload protection.

### 6. Municipal Heat Action Plan (HAP) Executive Brief Generator
- One-click generation of printable/exportable executive briefs compliant with **NDMA National Guidelines on Heatwave Preparation 2026** for Municipal Commissioners and District Disaster Management Authorities.

### 7. Risk Analyst Approval Workflow ("Human-in-the-Loop")
Directly implements the AI Risk Engine workflow:
$$\text{Raw Data} \longrightarrow \text{Processing \ and AI Risk Engine} \longrightarrow \text{Output for Review} \longrightarrow \text{Risk Analyst Approval} \longrightarrow \text{Multi-Channel Broadcast}$$
Includes a **System Feedback & Improvement** loop to log post-event hospital admissions and calibrate model weights.

---

## 🛠️ Technology Stack & Datasets

- **Datasets**:
  - **IMD**: Standards, heatwave classification criteria (Plains $\ge 40^\circ\text{C}$, Coastal $\ge 37^\circ\text{C}$, Hills $\ge 30^\circ\text{C}$, Departure $\ge 4.5^\circ\text{C}$).
  - **ERA5**: 30-year climatological baseline normals (1991–2020) and 95th summer percentiles.
  - **Open-Meteo**: Live 7-day hourly NWP stream (temperature, humidity, wind, direct solar radiation).
  - **NCMRWF**: Unified Model 4km regional ensemble NWP pipeline connector.
  - **IMD-NCDC**: Heat-Related Illness surveillance data across 284 districts.
- **Backend**:
  - Python 3.11 with FastAPI, Uvicorn, Requests, and Pydantic.
- **Frontend**:
  - React + TypeScript + Vite.
  - Leaflet GIS mapping with Dark Matter CartoDB tiles and ward choropleth layers.
  - Lucide icons, glassmorphism design system, custom SVG diurnal curve charts.

---

## 🚀 Running Locally

### Backend (FastAPI on Port 8000)
```powershell
powershell -Command "& 'e:\SIH_2026\python_embed\python.exe' -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"
```
Interactive Swagger API docs available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Frontend (Vite on Port 5173)
```powershell
cd e:\SIH_2026\frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
