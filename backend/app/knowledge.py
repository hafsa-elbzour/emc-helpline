# backend/app/knowledge.py
import docx
import os
# On importe l'outil professionnel de découpage de LangChain
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Partie 1 : Extraction du texte (Déjà validée ✅) ---
def extraire_texte(chemin_fichier):
    """Lit le fichier Word et retourne tout le texte sous forme de chaîne."""
    if not os.path.exists(chemin_fichier):
        print(f"❌ Erreur : Le fichier {chemin_fichier} est introuvable.")
        return None
    
    doc = docx.Document(chemin_fichier)
    texte_complet = []
    
    for paragraphe in doc.paragraphs:
        if paragraphe.text.strip():
            texte_complet.append(paragraphe.text)
            
    return "\n".join(texte_complet)

# --- Partie 2 : Découpage manuel (Pour ta compréhension 🧠) ---
def decouper_en_chunks(texte, taille_max=500):
    """Découpe le texte en petites fiches (chunks) sans couper les paragraphes."""
    paragraphes = texte.split("\n")
    chunks = []
    chunk_actuel = ""
    
    for paragraphe in paragraphes:
        if len(chunk_actuel) + len(paragraphe) > taille_max and chunk_actuel:
            chunks.append(chunk_actuel.strip())
            chunk_actuel = paragraphe
        else:
            if chunk_actuel:
                chunk_actuel += "\n" + paragraphe
            else:
                chunk_actuel = paragraphe
                
    if chunk_actuel.strip():
        chunks.append(chunk_actuel.strip())
        
    return chunks

# --- Zone de test ---
if __name__ == "__main__":
    chemin = "data/Ressources Chatbot (3).docx"
    
    print(" 1. Lecture du document en cours...")
    texte = extraire_texte(chemin)
    
    if texte:
        print(f"✅ Succès ! Le texte extrait fait {len(texte)} caractères.\n")
        
        # ==========================================
        # NOUVELLE ÉTAPE : Découpage avec LangChain
        # ==========================================
        print("🤖 2. Découpage intelligent avec LangChain (avec chevauchement) en cours...")
        
        # On configure l'outil professionnel
        # chunk_size = 500 (taille max d'une fiche)
        # chunk_overlap = 50 (chevauchement pour garder le contexte)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, 
            chunk_overlap=50
        )
        
        # On lance le découpage sur le texte
        chunks = text_splitter.split_text(texte)
        
        print(f"✅ Succès ! Nous avons créé {len(chunks)} fiches (chunks) avec LangChain.\n")
        
        print("🔍 Aperçu de la première fiche :")
        print("-" * 40)
        print(chunks[0])
        print("-" * 40)
        
        print("\n🔍 Aperçu de la deuxième fiche (pour voir le chevauchement) :")
        print("-" * 40)
        print(chunks[1])
        print("-" * 40)