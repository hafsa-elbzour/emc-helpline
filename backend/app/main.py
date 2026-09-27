from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Le backend EMC Helpline fonctionne !"}
@app.post("/chat")
def chat(message: str):
    return {"reponse": f"Tu as dit : {message}"}