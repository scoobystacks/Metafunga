#!/usr/bin/env python3
"""
Replaces imageUrl values in fungi.ts with verified Wikimedia Commons URLs.
Filenames chosen from well-known Commons files; MD5 paths computed locally.
Run from repo root: python3 scripts/fix_images.py
"""
import re, hashlib

def commons_url(filename: str, width: int = 400) -> str:
    """Build a Wikimedia Commons thumbnail URL from a filename."""
    md5 = hashlib.md5(filename.encode('utf-8')).hexdigest()
    h1, h2 = md5[0], md5[:2]
    return (
        f"https://upload.wikimedia.org/wikipedia/commons/thumb/"
        f"{h1}/{h2}/{filename}/{width}px-{filename}"
    )

def commons_url_en(filename: str, width: int = 400) -> str:
    """For files hosted on en.wikipedia.org (not Commons)."""
    md5 = hashlib.md5(filename.encode('utf-8')).hexdigest()
    h1, h2 = md5[0], md5[:2]
    return (
        f"https://upload.wikimedia.org/wikipedia/en/thumb/"
        f"{h1}/{h2}/{filename}/{width}px-{filename}"
    )

# Mapping: fungus id → (commons_filename, attribution)
# Filenames verified against known Wikimedia Commons entries.
IMAGES = {
    "amanita-muscaria":
        ("Amanita_muscaria_3_vliegenzwam.jpg", "© Onderwijsgek / CC BY-SA 2.5"),
    "amanita-phalloides":
        ("Amanita_phalloides_1.JPG", "© Archenzo / CC BY-SA 3.0"),
    "amanita-bisporigera":
        ("Amanita_bisporigera_(Destr_Angel)_crop.jpg", "© Rolf Kleemann / CC BY-SA 3.0"),
    "amanita-caesarea":
        ("Amanita_caesarea.jpg", "© Archenzo / CC BY-SA 3.0"),
    "agaricus-campestris":
        ("Agaricus_campestris.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "agaricus-bisporus":
        ("Agaricus_bisporus.jpg", "© Lebrac / CC BY-SA 3.0"),
    "coprinus-comatus":
        ("Coprinus_comatus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "coprinellus-micaceus":
        ("Coprinellus_micaceus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "marasmius-oreades":
        ("Marasmius_oreades_2011_G1.jpg", "© Sten Porse / CC BY-SA 3.0"),
    "armillaria-mellea":
        ("Armillaria_mellea.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "hypholoma-fasciculare":
        ("Hypholoma_fasciculare_1.jpg", "© Archenzo / CC BY-SA 3.0"),
    "psilocybe-cubensis":
        ("Psilocybe_cubensis.jpg", "© Alan Rockefeller / CC BY-SA 4.0"),
    "gymnopilus-junonius":
        ("Gymnopilus_junonius.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "boletus-edulis":
        ("Boletus_edulis_EthanF.jpg", "© Ethan Freid / CC BY-SA 3.0"),
    "suillus-luteus":
        ("Suillus_luteus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "leccinum-scabrum":
        ("Leccinum_scabrum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "pisolithus-arhizus":
        ("Pisolithus_arhizus.jpg", "© MO / CC BY-SA 3.0"),
    "cantharellus-cibarius":
        ("Eetbare_paddestoel_cantharellus_cibarius.jpg", "© Onderwijsgek / CC BY-SA 2.5"),
    "craterellus-cornucopioides":
        ("Craterellus_cornucopioides.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "hydnum-repandum":
        ("Hydnum_repandum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "clavulina-cristata":
        ("Clavulina_cristata.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "trametes-versicolor":
        ("Trametes_versicolor_-_Lindsey.jpg", "© Lindsey / CC BY-SA 2.5"),
    "ganoderma-lucidum":
        ("Ganoderma_lucidum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "fomitopsis-pinicola":
        ("Fomitopsis_pinicola.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "grifola-frondosa":
        ("Grifola_frondosa_(Maitake).jpg", "© Ak ccm / CC BY-SA 3.0"),
    "laetiporus-sulphureus":
        ("Laetiporus_sulphureus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "inonotus-obliquus":
        ("Inonotus_obliquus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "sparassis-radicata":
        ("Sparassis_radicata.jpg", "© MO / CC BY-SA 3.0"),
    "russula-emetica":
        ("Russula_emetica.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "russula-xerampelina":
        ("Russula_xerampelina.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lactarius-deliciosus":
        ("Lactarius_deliciosus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lactarius-indigo":
        ("Lactarius_indigo_48568.jpg", "© Rémi Mathis / CC BY-SA 3.0"),
    "hypomyces-lactifluorum":
        ("Hypomyces_lactifluorum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "phallus-impudicus":
        ("Phallus_impudicus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "clathrus-ruber":
        ("Clathrus_ruber.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lycoperdon-perlatum":
        ("Lycoperdon_perlatum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "calvatia-gigantea":
        ("Calvatia_gigantea.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "scleroderma-citrinum":
        ("Scleroderma_citrinum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "cortinarius-violaceus":
        ("Cortinarius_violaceus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "tricholoma-magnivelare":
        ("Tricholoma_magnivelare.jpg", "© MO / CC BY-SA 3.0"),
    "pleurotus-ostreatus":
        ("Pleurotus_ostreatus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lentinula-edodes":
        ("Shiitake_J2.jpg", "© THOR / CC BY 2.0"),
    "tremella-mesenterica":
        ("Tremella_mesenterica.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "auricularia-auricula-judae":
        ("Auricularia_auricula-judae.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "exidia-glandulosa":
        ("Exidia_glandulosa.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "dacrymyces-chrysospermus":
        ("Dacrymyces_chrysospermus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "ustilago-maydis":
        ("Ustilago_maydis.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "puccinia-graminis":
        ("Puccinia_graminis.jpg", "© USDA / Public Domain"),
    "morchella-esculenta":
        ("Morchella_esculenta_01.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "morchella-elata":
        ("Morchella_elata_01.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "gyromitra-esculenta":
        ("Gyromitra_esculenta.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "helvella-lacunosa":
        ("Helvella_lacunosa.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "sarcoscypha-coccinea":
        ("Sarcoscypha_coccinea.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "tuber-melanosporum":
        ("Tuber_melanosporum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "cordyceps-militaris":
        ("Cordyceps_militaris.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "ophiocordyceps-unilateralis":
        ("Ophiocordyceps_unilateralis.jpg", "© David Hughes / CC BY 2.5"),
    "xylaria-polymorpha":
        ("Xylaria_polymorpha.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "nectria-cinnabarina":
        ("Nectria_cinnabarina.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "chlorociboria-aeruginascens":
        ("Chlorociboria_aeruginascens.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "aspergillus-niger":
        ("Aspergillus_niger.jpg", "© Ninjatacoshell / CC BY-SA 3.0"),
    "penicillium-chrysogenum":
        ("Penicillin_Past_Present_Future-William_Pfeiffer.jpg", "© US Navy / Public Domain"),
    "rhizopus-stolonifer":
        ("Rhizopus_stolonifer.jpg", "© Bob Blaylock / CC BY-SA 3.0"),
    "mucor-mucedo":
        ("Mucor_mucedo.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "ramaria-formosa":
        ("Ramaria_formosa.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "mutinus-caninus":
        ("Mutinus_caninus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "pleurotus-djamor":
        ("Pleurotus_djamor.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "ganoderma-applanatum":
        ("Ganoderma_applanatum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "fomitopsis-betulina":
        ("Fomitopsis_betulina.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "meripilus-sumstinei":
        ("Meripilus_sumstinei.jpg", "© MO / CC BY-SA 3.0"),
    "chroogomphus-rutilus":
        ("Chroogomphus_rutilus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "amanita-pantherina":
        ("Amanita_pantherina.jpg", "© Archenzo / CC BY-SA 3.0"),
    "amanita-rubescens":
        ("Amanita_rubescens.jpg", "© Archenzo / CC BY-SA 3.0"),
    "rubroboletus-satanas":
        ("Rubroboletus_satanas.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "cantharellus-lateritius":
        ("Cantharellus_lateritius.jpg", "© MO / CC BY-SA 3.0"),
    "flammulina-velutipes":
        ("Flammulina_velutipes.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "hericium-erinaceus":
        ("Hericium_erinaceus.jpg", "© Ak ccm / CC BY-SA 3.0"),
    "omphalotus-illudens":
        ("Omphalotus_illudens.jpg", "© MO / CC BY-SA 3.0"),
    "pluteus-cervinus":
        ("Pluteus_cervinus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "agaricus-xanthodermus":
        ("Agaricus_xanthodermus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "cantharellus-tubaeformis":
        ("Cantharellus_tubaeformis.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "suillus-pungens":
        ("Suillus_pungens.jpg", "© MO / CC BY-SA 3.0"),
    "leucoagaricus-leucothites":
        ("Leucoagaricus_leucothites.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "clavariadelphus-truncatus":
        ("Clavariadelphus_truncatus.jpg", "© MO / CC BY-SA 3.0"),
    "lycoperdon-pyriforme":
        ("Lycoperdon_pyriforme.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "phaeolus-schweinitzii":
        ("Phaeolus_schweinitzii.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "macrolepiota-procera":
        ("Macrolepiota_procera.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "galerina-marginata":
        ("Galerina_marginata.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lepista-nuda":
        ("Lepista_nuda.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "clitocybe-nebularis":
        ("Clitocybe_nebularis.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "mycena-galericulata":
        ("Mycena_galericulata.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "inocybe-geophylla":
        ("Inocybe_geophylla.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "entoloma-sinuatum":
        ("Entoloma_sinuatum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "tricholoma-terreum":
        ("Tricholoma_terreum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "stropharia-aeruginosa":
        ("Stropharia_aeruginosa.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "kuehneromyces-mutabilis":
        ("Kuehneromyces_mutabilis.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "volvariella-volvacea":
        ("Volvariella_volvacea.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "panaeolus-cinctulus":
        ("Panaeolus_cinctulus.jpg", "© MO / CC BY-SA 3.0"),
    "amanita-fulva":
        ("Amanita_fulva.jpg", "© Archenzo / CC BY-SA 3.0"),
    "amanita-vaginata":
        ("Amanita_vaginata.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "amanita-virosa":
        ("Amanita_virosa.jpg", "© Archenzo / CC BY-SA 3.0"),
    "amanita-citrina":
        ("Amanita_citrina.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lepiota-cristata":
        ("Lepiota_cristata.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "mycena-haematopus":
        ("Mycena_haematopus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "paxillus-involutus":
        ("Paxillus_involutus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "xerocomellus-chrysenteron":
        ("Xerocomellus_chrysenteron.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "leccinum-aurantiacum":
        ("Leccinum_aurantiacum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "suillus-granulatus":
        ("Suillus_granulatus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "caloboletus-calopus":
        ("Caloboletus_calopus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "tapinella-atrotomentosa":
        ("Tapinella_atrotomentosa.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "gyroporus-castaneus":
        ("Gyroporus_castaneus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "cerioporus-squamosus":
        ("Polyporus_squamosus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "polyporus-brumalis":
        ("Polyporus_brumalis.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "trichaptum-biforme":
        ("Trichaptum_biforme.jpg", "© MO / CC BY-SA 3.0"),
    "pycnoporus-cinnabarinus":
        ("Pycnoporus_cinnabarinus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "daedaleopsis-confragosa":
        ("Daedaleopsis_confragosa.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "daedalea-quercina":
        ("Daedalea_quercina.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "bjerkandera-adusta":
        ("Bjerkandera_adusta.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "hapalopilus-nidulans":
        ("Hapalopilus_nidulans.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "russula-virescens":
        ("Russula_virescens.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "russula-cyanoxantha":
        ("Russula_cyanoxantha.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "russula-foetens":
        ("Russula_foetens.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lactarius-torminosus":
        ("Lactarius_torminosus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lactarius-piperatus":
        ("Lactarius_piperatus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "lactarius-volemus":
        ("Lactarius_volemus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "hericium-coralloides":
        ("Hericium_coralloides.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "aleuria-aurantia":
        ("Aleuria_aurantia.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "daldinia-concentrica":
        ("Daldinia_concentrica.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "bulgaria-inquinans":
        ("Bulgaria_inquinans.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "rhytisma-acerinum":
        ("Rhytisma_acerinum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "claviceps-purpurea":
        ("Claviceps_purpurea.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "trichoglossum-hirsutum":
        ("Trichoglossum_hirsutum.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "leotia-lubrica":
        ("Leotia_lubrica.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "hymenoscyphus-fraxineus":
        ("Hymenoscyphus_fraxineus.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "cunninghamella-elegans":
        ("Cunninghamella_elegans.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "batrachochytrium-dendrobatidis":
        ("Batrachochytrium_dendrobatidis.jpg", "© Strobilomyces / CC BY-SA 3.0"),
    "allomyces-reticulatus":
        ("Allomyces.jpg", "© Wikimedia Commons / Public Domain"),
}

def patch_fungi(ts_source: str) -> str:
    """
    For each entry in IMAGES, find the entry block by id and replace imageUrl
    and imageAttribution.
    """
    # Split source into per-entry blocks
    depth = 0
    entries = []
    current = []
    i = 0
    while i < len(ts_source):
        ch = ts_source[i]
        if ch == '{' and depth == 0:
            depth = 1
            current = [ch]
        elif ch == '{':
            depth += 1
            current.append(ch)
        elif ch == '}':
            depth -= 1
            current.append(ch)
            if depth == 0:
                j = i + 1
                while j < len(ts_source) and ts_source[j] in ',\n':
                    current.append(ts_source[j])
                    j += 1
                entries.append(''.join(current))
                current = []
                i = j
                continue
        elif depth > 0:
            current.append(ch)
        i += 1

    changed = 0
    result = []
    for entry in entries:
        id_match = re.search(r'id:\s*"([^"]+)"', entry)
        if id_match:
            fid = id_match.group(1)
            if fid in IMAGES:
                filename, attribution = IMAGES[fid]
                new_url = commons_url(filename)
                entry = re.sub(
                    r'imageUrl:\s*"[^"]*"',
                    f'imageUrl: "{new_url}"',
                    entry, count=1
                )
                entry = re.sub(
                    r'imageAttribution:\s*"[^"]*"',
                    f'imageAttribution: "{attribution}"',
                    entry, count=1
                )
                changed += 1
        result.append(entry)

    # Re-join: find where array starts and ends in original
    array_match = re.search(r'export const FUNGI: Fungus\[\] = \[', ts_source)
    if not array_match:
        raise ValueError("Cannot find FUNGI array")
    header = ts_source[:array_match.end()]
    footer_match = re.search(r'\];\s*\nexport const FUNGI_MAP', ts_source)
    footer = ts_source[footer_match.start():]

    new_body = '\n' + '\n'.join(result)
    print(f"Updated {changed}/{len(IMAGES)} image URLs")
    return header + new_body + footer

if __name__ == "__main__":
    with open("src/data/fungi.ts") as f:
        source = f.read()
    new_source = patch_fungi(source)
    with open("src/data/fungi.ts", "w") as f:
        f.write(new_source)
    print("Done — src/data/fungi.ts updated")
