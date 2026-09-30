from fastapi import FastAPI
from app.language import detecter_langue
from app.vectorstore import rechercher
from app.llm import generer_reponse_rag

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Le backend EMC Helpline fonctionne !"}


@app.post("/chat")
def chat(message: str):
    langue = detecter_langue(message)

    chunks_trouves = rechercher(message)
    contexte = "\n\n".join(chunks_trouves)

    reponse = generer_reponse_rag(question=message, contexte=contexte, langue=langue)

    return {"reponse": reponse, "langue": langue}