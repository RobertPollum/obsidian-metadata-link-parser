---
title: Weather + Machine Learning Prediction API
link: https://python.plainenglish.io/weather-ml-prediction-api-7f704484f1b9?source=rss----78073def27b8---4
author: Michael Faraday Otieno
publish_date: 2026-01-18 15:02:30
saved_date: 2026-01-19 07:03:07
image: https://cdn-images-1.medium.com/max/940/1*L2Mh3VgNemfuO0_gUCR7oA.jpeg
tags: #github #api-development #machine-learning #fastapi #python
---

![image](https://cdn-images-1.medium.com/max/940/1*L2Mh3VgNemfuO0_gUCR7oA.jpeg)

![](https://cdn-images-1.medium.com/max/940/1*L2Mh3VgNemfuO0_gUCR7oA.jpeg)

### Introduction

This project demonstrates a **FastAPI API** that combines **real-time weather data** with a **local machine learning model** to make predictions. For example, it can recommend clothing based on the temperature or classify weather-related risk levels.

All the project files, including the FastAPI app, the lightweight MLP model, test scripts, and requirements, are available on **GitHub**: [https://github.com/FaradayOtieno/ml\_weather\_api](https://github.com/FaradayOtieno/ml_weather_api) you can clone or download the repo and run it locally.

This project shows:

-   Integration of **local ML models** with **external APIs**
-   **Token-based authentication** for secure API access
-   **Logging, environment variables, and error handling** often skipped by beginners
-   Clear **JSON response structure**, suitable for frontend integration

### Use Cases

-   **Personal assistants**: suggest clothing or outdoor activities
-   **IoT projects**: feed weather data to smart devices and make ML predictions
-   **Portfolio / learning**: demonstrates API + ML integration, security, and clean design

#### 1: Environment Setup

We use Python virtual environments, FastAPI, PyTorch for ML, and requests to access online APIs.

\# requirements.txt  
fastapi  
uvicorn  
torch  
scikit-learn  
pydantic  
requests  
python-dotenv

**Explanation:**

Specifying dependencies ensures reproducibility. Beginners often skip this step, which leads to “works on my machine” issues. python-dotenv lets you keep API keys and tokens out of your code for security.

#### 2: Environment Variables

Create a .env file in your project folder:

ML\_API\_TOKEN=secret-token-123  
OPENWEATHER\_API\_KEY=YOUR\_OPENWEATHER\_API\_KEY   
  
\# i'll use 4618a0c7f50054e3366003edd475519a

> _Replace_ _YOUR\_OPENWEATHER\_API\_KEY with your real OpenWeatherMap API key._

**Why:**

-   Prevents hardcoding sensitive information in your code
-   Ensures your project is safe to push to GitHub

Load these variables in your project:

from dotenv import load\_dotenv  
import os  
  
load\_dotenv()  # loads .env from current directory  
ML\_API\_TOKEN = os.getenv("ML\_API\_TOKEN")  
OPENWEATHER\_API\_KEY = os.getenv("OPENWEATHER\_API\_KEY")  
  
if not ML\_API\_TOKEN or not OPENWEATHER\_API\_KEY:  
    raise ValueError("API tokens not found in .env file")

**Explanation:**  
Using environment variables keeps your secrets safe. Beginners often hardcode API keys, which is insecure.

#### 3\. Local ML Model

We use a **lightweight MLP** that predicts a categorical value based on temperature:

import torch  
import torch.nn as nn  
import os  
  
\# Ensure models folder exists  
os.makedirs("models", exist\_ok=True)  
  
class MLP(nn.Module):  
    def \_\_init\_\_(self, input\_dim=1, hidden\_dim=8, output\_dim=3):  
        super().\_\_init\_\_()  
        self.fc1 = nn.Linear(input\_dim, hidden\_dim)  
        self.fc2 = nn.Linear(hidden\_dim, output\_dim)  
      
    def forward(self, x):  
        x = torch.relu(self.fc1(x))  
        x = self.fc2(x)  
        return x  
  
\# Save a dummy model if it doesn't exist  
model\_path = "models/mlp\_model.pth"  
if not os.path.exists(model\_path):  
    model = MLP()  
    torch.save(model.state\_dict(), model\_path)  
    print(f"✅ Dummy model saved at {model\_path}")

**Explanation:**

-   The MLP is intentionally small to run on any machine
-   map\_location="cpu" ensures compatibility without GPU

#### 4\. FastAPI App with Token Authentication

from fastapi import FastAPI, HTTPException, Header, Depends  
import logging  
import requests  
import torch  
from ml\_model import MLP  
  
\# Logging setup  
logging.basicConfig(level=logging.INFO)  
  
\# FastAPI app  
app = FastAPI(title="ML + Weather Demo API")  
  
\# Token authentication  
def token\_auth(x\_api\_key: str = Header(...)):  
    if x\_api\_key != ML\_API\_TOKEN:  
        logging.warning(f"Unauthorized token attempt: {x\_api\_key}")  
        raise HTTPException(status\_code=401, detail="Unauthorized")  
    return True  
  
\# Load ML model  
model = MLP()  
model.load\_state\_dict(torch.load(model\_path, map\_location="cpu"))  
model.eval()

**Explanation:**

-   Protects endpoints with header-based token authentication
-   Logging unauthorized attempts helps track potential misuse

#### 5\. Weather + ML Endpoint

@app.get("/weather\_predict/{city}")  
def weather\_predict(city: str, auth: bool = Depends(token\_auth)):  
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER\_API\_KEY}&units=metric"  
    res = requests.get(url)  
    if res.status\_code != 200:  
        raise HTTPException(status\_code=404, detail="City not found or API error")  
      
    data = res.json()  
    temp = data\['main'\]\['temp'\]  
    weather\_desc = data\['weather'\]\[0\]\['description'\]  
  
    # ML prediction  
    x\_tensor = torch.tensor(\[\[temp\]\], dtype=torch.float32)  
    with torch.no\_grad():  
        out = model(x\_tensor)  
        pred = torch.argmax(out, dim=1).item()  
      
    logging.info(f"{city}: Temp={temp}°C, ML Prediction={pred}")  
      
    return {  
        "city": city,  
        "temperature": temp,  
        "weather": weather\_desc,  
        "ml\_prediction": pred  
    }  
  
@app.get("/")  
def root():  
    return {"message": "ML + Weather Demo API running. Use /weather\_predict/{city} with x-api-key header."}

**Explanation:**

-   Requests real-time weather data from OpenWeatherMap
-   Converts temperature to a tensor for ML prediction
-   torch.no\_grad() avoids computing gradients, making it more efficient
-   Returns a clean JSON response

#### 6\. Running the API Locally

\# Run on Command Prompt  
\# For my case, databotenvironment is my virtual environment.  
  
databotenvironment\\Scripts\\activate  
cd C:\\Users\\user\\Desktop\\ml\_dataset  
uvicorn ml\_weather\_demo:app --reload

**Explanation:**

-   Visit in browser: [http://127.0.0.1:8000/weather\_predict/Nairobi](http://127.0.0.1:8000/weather_predict/Nairobi)
-   Add header: x-api-key: secret-token-123

✅ You get a JSON response with **real weather + ML prediction**.

#### 7\. API Test

import requests  
  
\# API URL  
base\_url = "http://127.0.0.1:8000/weather\_predict/"  
  
\# API token  
headers = {  
    "x-api-key": "secret-token-123"  
}  
  
\# Cities for demo  
cities = \["Mombasa", "Nairobi", "Kisumu", "Garissa"\]  
  
\# Loop through cities and get predictions  
for city in cities:  
    response = requests.get(f"{base\_url}{city}", headers=headers)  
    if response.status\_code == 200:  
        data = response.json()  
        print(f"{city} → Temp: {data\['temperature'\]}°C, Weather: {data\['weather'\]}, ML Prediction: {data\['ml\_prediction'\]}")  
    else:  
        print(f"{city} → Error: {response.status\_code}, {response.json()\['detail'\]}")

#### Explanation

1.  **base\_url** points to your local FastAPI endpoint.
2.  **headers** include your token for authentication.
3.  We loop through **Mombasa, Nairobi, Kisumu, and Garissa** and make GET requests.
4.  If the request succeeds (status\_code == 200), we print the **temperature, weather description, and ML prediction**.
5.  If there’s an error (city not found, API error), we print the error message.

**_Result;_**

Mombasa → Temp: 25.8°C, Weather: scattered clouds, ML Prediction: 1  
Nairobi → Temp: 18.14°C, Weather: scattered clouds, ML Prediction: 1  
Kisumu → Temp: 22.22°C, Weather: scattered clouds, ML Prediction: 1  
Garissa → Temp: 30.69°C, Weather: clear sky, ML Prediction: 1

#### 8\. Recommendations

-   **Keep secrets safe**: Use .env files, never hardcode tokens
-   **Log everything**: Track API usage and ML predictions
-   **Batch predictions**: Extend the API for multiple cities
-   **Error handling**: Always check external API responses
-   **Documentation**: FastAPI auto-docs (/docs) are portfolio-friendly
-   **Deployment**: Host on Render, Heroku, or AWS for public access

#### 9\. Conclusion

This project demonstrates **real-world integration of ML with APIs**:

-   FastAPI development
-   Token authentication for secure endpoints
-   Handling online API data
-   Local ML predictions integrated into production-ready endpoints

It’s a **complete portfolio-ready project** showing **security, logging, and clean design**, not just ML or API separately.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=7f704484f1b9)

* * *

[Weather + Machine Learning Prediction API](https://python.plainenglish.io/weather-ml-prediction-api-7f704484f1b9) was originally published in [Python in Plain English](https://python.plainenglish.io) on Medium, where people are continuing the conversation by highlighting and responding to this story.