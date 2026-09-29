from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

LANGUES_SUPPORTEES = ["fr", "ar"]
LANGUE_PAR_DEFAUT = "fr"


def detecter_langue(texte: str) -> str:
    try:
        langue = detect(texte)
    except Exception:
        return LANGUE_PAR_DEFAUT

    if langue in LANGUES_SUPPORTEES:
        return langue
    return LANGUE_PAR_DEFAUT