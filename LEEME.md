# SISTEMA EIRENDOR EL ALBOR DE LA QUINTA EDAD PARA FOUNDRY VTT

Sistema para Foundry VTT que permite jugar con partidas basadas en Eirendor: el Albor de la Quinta Edad (Eirendor) y varios de sus sabores adicionales (Pulp, Leyendas de Arkham, etc.)

## INTRODUCCIÓN

Eirendor es un reglamento basado en el SRD de 3.X y 5ed, liberado de forma gratuita por sus creadores (y editores) en formato PDF. Todo el contenido relacionado con este sistema puede consultarse y descargarse libremente desde la siguiente página web:

http://www.sinergiaderol.com/juegosgratuitos/j-eirendor.html

## INSTALACIÓN

Para instalar y usar el sistema para Eirendor en Foundry Virtual Tabletop, simplemente pegue la siguiente URL en el cuadro de diálogo **Install System** del menú Configuración:

https://raw.githubusercontent.com/fragarco/eirendor/main/system.json

Si desea instalar manualmente el sistema, debe clonarlo o extraerlo en la carpeta "Data/systems/eirendor".

## INSTRUCTIONES

### Actores

El sistema actual soporta dos tipos de Actores:

- **player**: pensado para personajes jugadores.
- **non-player**: pensado para representar a los monstruos y enemigos.

Las dos hojas de personaje incluyen la característica de **Cordura**, tal y como aparece en el módulo **A4 El Palacio de los Sueños** y en **Leyendas de Arkham**. Algunos valores como el bono de competencia o los puntos de esfuerzo se calculan de forma automática, mientras que otros, como la clase de armadura o los puntos de golpe, se deben introducir a mano. El autor considera que siempre es mejor poder introducir un valor a mano a que todo se autocalcule y un error en los cálculos impida usar el sistema.

### Tiradas

Para realizar las tiradas basta con hacer click sobre el nombre de la característica, habilidad o arma. La tirada en el chat siempre incluye dos resultados, de forma que se pueda aplicar ventaja o desventaja sin necesidad de realizar tiradas adiconales. En aras de la sencillez y la rapidez, no se incluye ningún dialogo intermedio para poder aplicar modificadores, los jugadores deberán aplicarlos de cabeza a los resultados del chat.

Los resultados de las tiradas pueden aparecer coloreados en cuatro colores diferentes:
- Negro: resultado natural entre 2 y 18
- Rojo: posible pifia, resultado natural de 1
- Azul: posible crítico dependiendo de ciertos talentos, resultado natural de 19
- Verde: posible crítico, resultado natural de 20

### Conjuros

La ficha incluye en la pestaña de **Conjuros**, cajas númericas para utilizar el sistema de Runas (magia vaciana) del manual básico de Eirendor. De las misma forma, los conjuros, una vez listados en la tabla del personaje, incluye la opción de "prepararlos". Obviamente si se usa el sistema por defecto de puntos de poder, estos editores no tienen significado alguno.

### Equipo

El sistema incluye compendios con las armas, armaduras y pertrechos aparecidos en Eirendor: El Albor de la Quinta Edad y en Leyendas de Arkham.

#### Objetos almacenados

Pinchando en el nombre de un objeto del equipo, este pasa a estar en estado "almacenado", o de "almacenado" a estado "transportado". Solo los objetos "transportados" cuentan para el computo de peso transportado. Aquellos objetos que se almacenen dentro de una mochila, por ejemplo, deberían dejarse en estado "almacenado".

Los objetos cuentan con una propiedad llamada "Capacidad". La capacidad puede utilizarse para indicar que carga puede soportar un objeto como una mochila o una bolsa, o para indicar las cargas de o usos de un objeto (como por ejemplo un kit médico).

#### Competencia en armas

La ficha de personaje no calcula de forma automática para que armas es competente un personaje. Las armas transportadas aparecen también en la pestaña de **Combate**. En esa tabla es posible activar el icono de "competente", lo que debe hacer el jugador a mano.

## LICENCIA

Todo el código (HTML / CSS / JavaScript) de este repositorio se publica bajo la licencia GPLv3 (consultar el archivo LICENSE para más detalles sobre la licencia).

El contenido específico del juego, como los atributos de los personajes, las características de los monstruos o las descripciones de los hechizos; se designa como "open game" según lo descrito por la Licencia OGL v1.0a (consultar el archivo OGL.txt para obtener más detalles). El nombre "Eirendor" así como cualquier detalle de su ambientación se designa como "Product Identity" y está amparado por la licencia CC-By-SA 4.0.

Iconos incluidos bajo la licencia Creative Commons 3.0 BY. Los diferentes iconos han sido creados por:

- Lorc, http://lorcblog.blogspot.com
- Delapouite, https://delapouite.com
- Carl Olsen, https://twitter.com/unstoppableCarl
- Sbed, http://opengameart.org/content/95-game-icons
- Willdabeast, http://wjbstories.blogspot.com
- Lucas
- Skoll
- DarkZaitzev, http://darkzaitzev.deviantart.com

Más información e iconos en https://game-icons.net