# Studio 3D EuraTech'Kids (artifact claude.ai)
Page unique assemblée à partir de `app.html` en remplaçant :
`__MODEL__` (modèle par défaut .ldr), `__PARTS__` (pack JSON embarqué ou `null`),
`__CORE__` (core.js), `__IOZIP__` (iozip.js), `__GEN__` (gen.js), `__APP__` (app.js),
en retirant les lignes `module.exports` des modules.
Artifact : https://claude.ai/artifact/6iR7y535NauzLjgbD56bB6 (slug 2e460d6b-5c7d-4364-9eb0-789165c93599).
Capacités déclarées : assets, downloads, user, db (règle : lecture view, écriture admin).
Collections db : `robots/{id}` (name, desc, ldr, packId, thumbId, cams, nParts, nSteps, createdAt).
