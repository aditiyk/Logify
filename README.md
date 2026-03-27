<p align="center">
  <img src="./box.svg" width="80" alt="Logify Logo" />
  <h1 align="center">Logify</h1>
  <p align="center">
    <strong>Autonomous Supply Chain Disruption Management Platform</strong>
  </p>
</p>

## Overview
Logify is a cutting-edge, human-in-the-loop autonomous supply chain intelligence platform. Built with a 3-agent orchestration architecture, it continuously monitors shipments, senses real-world disruptions (like severe weather or port congestion), and intelligently recalculates logistics routes natively in the browser. 

Instead of relying on simple, static baseline costs, Logify models the real-world business impact by combining an advanced **5-Pillar Disruption Matrix**. The platform visualizes all of this activity across a gorgeous, edge-to-edge widescreen dashboard, interactive Leaflet tracking maps, and fully auditable execution logs.

<p align="center">
<img src="./Dashboard.svg" width="80" alt="Dashboard" />
</p>
---

## 5-Pillar Impact Matrix
Logify's LLM engine has been carefully coded with strict constraint formulas to find the lowest **Total Impact Score**:

1. **Incremental Cost:** Negative modifiers for natively cheaper routes, positive modifiers for premium alternatives.
2. **Delay Impact:** Formulaic penalty triggered dynamically by `delay_days * (50 + priority_multiplier + sensitivity_multiplier)`.
3. **Risk Penalty Constraint:** Cross-examines Transport Mode array against Disruption Type to flag Risk factors. Multiplied aggressively by `1000` to simulate operational hazards. The AI strictly filters out HIGH risk routes entirely if safe alternatives exist.
4. **Switching Cost Overhead:** Dynamically adds a flat 10% fee to total impact if switching routes from active manifests.
5. **SLA Breaches:** Tracks static `expected_delivery_days` mapped to the supplier. If effective time hits the limit, an absolute `delay_days * 1500` massive penalty is stacked on the rating.

---

## 🏗️ Architecture

Logify is powered by a robust LangGraph agent ecosystem, split fundamentally into three intelligent nodes:

1. **Sense Agent (`sense_agent.py`)**
   - Ingests mock satellite, port, and weather feeds. 
   - Bridges metadata variables (priority, sensitivity, transport mode, expected delivery constraints) and runs an initial severity assessment report.
2. **Decision Agent (`decision_agent.py`)**
   - Evaluates the 5-Pillar penalty impact across routes based on explicit algorithm thresholds. 
   - Submits a payload to the LLM backend to clearly articulate *why* a particular decision is recommended, specifically citing SLA breaches, Risk, and Monetary trade-offs without generic hallucination.
3. **Action Agent (`action_agent.py`)**
   - Operates entirely behind a Human-In-The-Loop wall.
   - Waits for 60 seconds (simulated 24-hours) on the impact panel. If a human operator clicks 'Approve', or explicitly overrides the AI and picks an Alternative option, the Action Agent permanently commits the custom route parameters to the SQLite database and logs the audit string.
   
---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v4, Lucide React, React-Router, React-Leaflet.
- **Backend:** Python, FastAPI, LangChain/LangGraph, SQLite, SQLAlchemy, Pydantic.

---

## 🚀 Quick Start Guide

Since everything is pre-configured, spinning up both halves of the project requires two terminal windows.

### 1. Start the Backend API

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a pristine Python virtual environment:
   * Windows: `python -m venv venv` and `.\venv\Scripts\activate`
   * Mac/Linux: `python3 -m venv venv` and `source venv/bin/activate`
3. Install the engine dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI Uvicorn server:
   ```bash
   uvicorn main:app --reload
   ```
   *The SQLite database (`logify.db`) will automatically seed itself with fresh shipments and disruptions if it is empty!*

### 2. Start the Frontend Application

1. Open a second terminal and navigate to the UI directory:
   ```bash
   cd frontend
   ```
2. Install the Node packages:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. Head over to `http://localhost:5173` in your browser!

Enjoy the hyper-modern logistics future! :D
