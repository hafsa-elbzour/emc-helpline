import chromadb
from chromadb.utils import embedding_functions
from app.knowledge import extraire_texte
from langchain_text_splitters import RecursiveCharacterTextSplitter

CHEMIN_DOCUMENT = "data/Ressources Chatbot (3).docx"
DOSSIER_CHROMA = "data/chroma_db"

# On dit à ChromaDB d'utiliser notre modèle multilingue,
# le même que dans embeddings.py.
fonction_embedding = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="paraphrase-multilingual-MiniLM-L12-v2"
)

client = chromadb.PersistentClient(path=DOSSIER_CHROMA)

collection = client.get_or_create_collection(
    name="ressources_emc",
    embedding_function=fonction_embedding,
)


def construire_base():
    """Lit le document, le découpe, et range les fiches dans ChromaDB."""
    texte = extraire_texte(CHEMIN_DOCUMENT)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_text(texte)

    collection.add(
        documents=chunks,
        ids=[f"chunk_{i}" for i in range(len(chunks))],
    )

    print(f"✅ {len(chunks)} fiches ajoutées dans ChromaDB (modèle multilingue).")


def rechercher(question: str, nombre_resultats: int = 3):
    """Retrouve les fiches les plus proches en sens d'une question."""
    resultats = collection.query(
        query_texts=[question],
        n_results=nombre_resultats,
    )
    return resultats["documents"][0]


if __name__ == "__main__":
    construire_base()