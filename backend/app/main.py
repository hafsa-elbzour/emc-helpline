from fastapi import FastAPI
from app.language import detecter_langue

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Le backend EMC Helpline fonctionne !"}


@app.post("/chat")
def chat(message: str):
    langue = detecter_langue(message)
    return {"reponse": f"Tu as dit : {message}", "langue": langue}