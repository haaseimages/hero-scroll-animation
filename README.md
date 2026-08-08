# Skin Art Cosmetics – isolierte Hero-Scroll-Animation

`index.html` kann direkt im Browser geöffnet werden. Alle benötigten Bilder,
Schriften und GSAP-Dateien liegen lokal im Ordner `assets`; eine WordPress-
Installation oder Internetverbindung ist nicht nötig.

## Herkunft der Komponenten

- Child-Theme: Hero-Markup, acht Desktop-/Mobile-Bildpaare und `hero-scroll.js`
- Standard-Theme: GSAP, ScrollTrigger, ScrollSmoother und dessen Initialisierung
- `demo.css`: auf die Hero-Komponente reduzierte Styles aus beiden Themes

## Funktionsweise

ScrollTrigger pinnt die Bühne. Während des Scrollens wird die Titelliste um den
Abstand zwischen erstem und letztem Titel nach oben bewegt. An den jeweiligen
Titelpositionen wechselt `is-active`; gleichzeitig blendet GSAP das zugehörige
Bild ein und das vorherige aus. Ein kurzer Endpuffer hält das letzte Motiv noch
sichtbar. Danach endet das Pinning und der normale Seiteninhalt folgt.

Der Abschlussbereich liegt wie im WordPress-Ursprung innerhalb von
`hero-scroll-stage`. Dadurch wird er nicht durch den zusätzlichen Pin-Abstand
von der Hero weggerückt; ScrollTriggers Erweiterung entsteht erst unterhalb der
gesamten Bühne.

Die ursprünglichen SCSS-Dateien enthalten eine Kaskadenüberschreibung: Der
mobile Listenabstand von 4–10 px wird durch eine später ausgegebene Tablet-Regel
auf 28–56 px erhöht. Die isolierte Demo setzt nach dieser Analyse den kompakten
Abstand bis 849,98 px explizit durch. Die originale mobile `line-height: 1` für
Bildschirme bis 499,98 px bleibt unverändert.

Auf Geräten mit grober Zeigereingabe sowie bei aktivierter Einstellung
„Bewegung reduzieren“ bleibt ScrollSmoother deaktiviert. Die Hero-Sequenz selbst
bleibt über ScrollTrigger nutzbar; der Bild-Parallaxeffekt entfällt bei
reduzierter Bewegung.
# hero-scroll-animation
