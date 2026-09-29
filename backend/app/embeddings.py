from sentence_transformers import SentenceTransformer, util

# On charge le modèle une seule fois, au démarrage.
# "paraphrase-multilingual-MiniLM-L12-v2" comprend le français et l'arabe.
modele = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


def generer_embedding(texte: str):
    """Transforme un texte en une liste de nombres représentant son sens."""
    return modele.encode(texte)


if __name__ == "__main__":
    phrase_1 = "Je me fais harceler en ligne"
    phrase_2 = "Quelqu'un m'embête sur les réseaux sociaux"
    phrase_3 = "Il fait beau aujourd'hui"

    emb_1 = generer_embedding(phrase_1)
    emb_2 = generer_embedding(phrase_2)
    emb_3 = generer_embedding(phrase_3)

    similarite_proche = util.cos_sim(emb_1, emb_2)
    similarite_eloignee = util.cos_sim(emb_1, emb_3)

    print(f"'{phrase_1}' vs '{phrase_2}'")
    print(f"Score de similarité (devrait être élevé) : {similarite_proche.item():.4f}\n")

    print(f"'{phrase_1}' vs '{phrase_3}'")
    print(f"Score de similarité (devrait être bas) : {similarite_eloignee.item():.4f}")