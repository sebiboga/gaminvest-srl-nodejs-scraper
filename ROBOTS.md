# Robots.txt Analysis — GAMINVEST Careers

Sursa: https://www.gaminvest.ro/robots.txt

## Reguli

```
User-agent: *
Allow: /
Sitemap: https://www.gaminvest.ro/sitemap.xml
Disallow: /cgi-bin/
Disallow: /wp-admin/
Disallow: /wp-includes/
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/` | ✅ Da | Pagina principală |
| `/cariere.html` | ✅ Da | Pagina de cariere |
| `/cgi-bin/*` | ❌ Disallowed | Scripturi server |
| `/wp-admin/*` | ❌ Disallowed | Administrare WordPress |
| `/wp-includes/*` | ❌ Disallowed | Fișiere interne WordPress |

## Recomandare

robots.txt NU este legal binding, dar reprezintă intenția proprietarului site-ului.

- GAMINVEST nu blochează API-ul sau paginile de job
- Scraperul curent face o singură cerere per pagină cu delay de 1s între pagini — comportament rezonabil, nu agresiv

**Concluzie**: Risc minim. Site-ul e permisiv, iar scraperul e politicos (rate limiting, User-Agent standard, o singură cerere simultană).
