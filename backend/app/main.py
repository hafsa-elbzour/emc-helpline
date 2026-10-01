from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.language import detecter_langue
from app.vectorstore import rechercher
from app.llm import generer_reponse_rag

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)


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