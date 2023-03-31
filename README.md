# Directed Oriented Bounding Box Annotation tool

This tool is a simple html/css/js site to annotate with oriented bounded box. It was made to annotate bees and only bees so everything is made with that in mind. Furthermore, as it uses the file system, it needs to be hosted on a server, local or not. The simplest way would be to use the Live Server extension on VSCode or run it from the command line.

The mechanics are simple:
- Place 3 points to make a box. The first two point represent the front/top face of the box, while the third point represent the tail of the box.
- To cancel the placement of a point or creation of a box press **a**
- To select a box press on it in the side bar. To unselect it, press it again. You can select mutliple boxes.
- To deleted selected box(es) press **d**.
- To switch between images press the arrow keys.
- To download the annotations press the download button. The annotations will be named image_name.txt.
- The program will try to load annotations for selected images.
- The annotation format is the corner vertices of the rectangle in clockwise order starting from the yellow (front) one. (x1,y1,x2,y2,x3,y3,x4,y4,0,1)
- To use images place them in the images folder.

Tips:
- The code is probably very bugy, don't try anything crazy
- Don't start changing the aspect ratio once you started annotating an image. Really, you could reload the page if you change, I can't garanty the annotations will match. I think they will tho.

Rectangle from a triangle:
To make a rectangle from a triangle I take the third point that was placed and draw a line to the middle of the first two points. I use that as the direction of the square. I then rotate the first two points around their midpoint so that the line they draw it perpendicular to the direction. The actual third and fourth of the square are the second and first point shifted down to the level of the third placed point on the axis of the direction.
