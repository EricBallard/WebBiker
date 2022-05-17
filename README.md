# WebBiker
Ride the gnar with WebBiker, a procedurally generated 2D motocross game supporting desktop and mobile!

### Live Demo: https://WebBiker.tk

  
![LAMP](/media/lamp_stack_logo.png)
  
***Built on the LAMP stack***


## Features
- Cross-platform, PC & Mobile friendly
- Procedurally generated terrain
- 2D game with hiscores

## Security
With any online application securty is essential for intregity.
  
As such the game will collect information about connecting
client such as; IP, user-agent, screen-size, and browser-flags.
Once verified a time-sensitive Json Web Token will be issued 
in the form of a Cookie! The JWT is then sent as a parameter
when requesting to submit a new score, integrity is
verified server sided via PHP session.

## Gameplay
![PC](/media/pc_demo.gif)
  
![Mobile](/media/mobile_demo.gif)
