Carte de France choroplèthe interactive
==========================================================

Démonstration
--------------

http://kerneis.github.com/france-choropleth/

Explications
-----------

La fonction renvoyée par le code Javascript dans le champ de texte est appliquée
à chaque subdivision administrative; la carte est ensuite colorée en fonction de
la valeur associée par la fonction à chaque territoire.  La granularité des
subdivision est réglable par l'intermédiaire de la liste déroulante :
départements, arrondissements, cantons ou communes.

Cette fonction reçoit deux arguments.  Le premier est une fonction qui permet
récupérer les valeurs statistiques associées à la subdivision courante ; si une
valeur n'est pas disponible à ce niveau de granularité, elle est recherchée
successivement dans les niveaux supérieurs.  La liste des valeurs disponibles
est affichée en bas de la page.  Le second argument est un objet contenant
diverses propriétés de la subdivision courante (extraites de la base Géofla de
l'IGN).  Elle doit renvoyer un nombre, entier ou flottant.

Il est également possible d'accéder aux données statistiques par l'intermédiaire
de la variable data.  Par exemple, pour l'abstention au second tour de la
présidentielle 2012 dans le canton 02 du département 45 :
    data.canton["4502"]["pres_2012_T2_Abstentions"]

La légende est automatiquement calculée entre le minimum et le maximum des
valeurs obtenues pour la France entière.  Cet intervalle est divisé en autant
d'intervalles que le nombre de couleurs choisi, ou bien linéairement
(intervalles de même taille), ou bien à l'aide de quantiles (même nombre de
territoires dans chaque intervalle).

L'échelle dite « linéaire symétrique » agit de façon un peu magique (et porte
très mal son nom, je suis ouvert à des propositions plus pertinentes).   Si
l'intervalle des valeurs contient zéro, elle le centre en zéro ; s'il ne
contient pas zéro, elle le fait débuter (ou finir s'il est négatif) à zéro.
Elle est particulièrement utile pour visualiser des variations (différence à la
moyenne par exemple), associée à une palette de la catégorie « divergeante ».

Les palettes de couleurs ont été conçues par Cynthia Brewer.  Elles sont très
mal nommées, mais j'ai simplement essayé de coller aux noms originaux.

Gabriel Kerneis <gabriel@kerneis.info>
