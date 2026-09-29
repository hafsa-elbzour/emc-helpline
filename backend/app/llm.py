# backend/app/llm.py
import os
from dotenv import load_dotenv
from google import genai

# 1. Charger la clé API
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ ERREUR CRITIQUE : GEMINI_API_KEY manquante dans .env")

client = genai.Client(api_key=api_key)

def generer_reponse_rag(question: str, contexte: str, langue: str) -> str:
    """
    Construit le prompt augmenté et interroge Gemini.
    """
    
    prompt_final = f"""
Tu es l'assistant virtuel officiel de l'Espace Maroc Cyberconfiance (EMC-Helpline).
Ton rôle est d'aider les victimes de cyberviolences au Maroc avec empathie, précision et sécurité.

RÈGLES ABSOLUES À RESPECTER STRICTEMENT :
1. BASE-TOI UNIQUEMENT SUR LE CONTEXTE FOURNI CI-DESSOUS. N'invente aucune loi, aucun numéro de téléphone, ni aucun conseil juridique ou psychologique qui ne figure pas dans le contexte.
2. Si le contexte ne contient pas la réponse à la question, dis poliment : "Je n'ai pas cette information spécifique dans ma base actuelle, mais je vous invite vivement à contacter notre assistance humaine au 2511."
3. PROTOCOLE D'URGENCE : Si la question de l'utilisateur exprime des idées suicidaires, de l'automutilation ou un danger imminent (mots-clés : suicide, mourir, me tuer, plus la force, etc.), IGNORE TOUT LE RESTE et réponds IMMÉDIATEMENT par : 
   "Votre sécurité est notre priorité absolue. Ce que vous vivez est grave. Veuillez contacter immédiatement le numéro vert 2511 (ONDE) ou les services d'urgence. Vous n'êtes pas seul(e)."
4. TON : Empathique, rassurant, non-jugeant, professionnel et clair. Évite le jargon technique complexe.
5. LANGUE : Tu dois répondre IMPÉRATIVEMENT en [{langue}].

CONTEXTE OFFICIEL EMC (Sources fiables extraites du document de référence) :
-------------------------
{contexte}
-------------------------

QUESTION DE L'UTILISATEUR :
{question}

RÉPONSE DÉTAILLÉE ET EMPATHIQUE :
"""

    # --- Vérification : on affiche ce qu'on envoie réellement ---
    print("=== PROMPT ENVOYÉ À GEMINI ===")
    print(prompt_final)
    print("================================")

    try:
        generation_config = {
            "temperature": 0.1,
            "max_output_tokens": 1024,
            "thinking_level": "low"
        }

        interaction = client.interactions.create(
            model="gemini-3.8-flash",
            input=prompt_final,
            generation_config=generation_config
        )
        
        return interaction.output_text.strip()
        
    except Exception as e:
        print(f"Erreur détaillée lors de l'appel : {e}")
        return f"Erreur technique : {str(e)}"

# --- Zone de test local ---
if __name__ == "__main__":
    print("🧪 Test du Prompt RAG avec Gemini 3.8 Flash (Config Dict)...")
    
    faux_contexte = (
        "La loi 103.13 punit le cyberharcèlement sexuel. "
        "Le numéro vert ONDE est 2511. "
        "Pour porter plainte, utilisez la plateforme E-BLAGH."
    )
    fausse_question = "Quelle est la loi contre le harcèlement en ligne ?"
    
    reponse_test = generer_reponse_rag(
        question=fausse_question,
        contexte=faux_contexte,
        langue="fr"
    )
    
    print(f"\n💬 Réponse de Gemini :\n{reponse_test}")