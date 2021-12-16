import React from 'react';
import Particles from "react-tsparticles";
import { useTheme } from '@mui/material';
import './particle.module.less';

/* eslint-disable-next-line */
export interface ParticleProps { }

export function Particle(props: ParticleProps) {

  const theme = useTheme();

  const particlesInit = (main: any) => {

  };

  const particlesLoaded = (container: any) => {

  };
  return (
    <Particles
      style={{ position: "absolute", zIndex: -1 }}
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        "background": {
          "color": {
            "value": theme.palette.background.default
          }
        },
        "fullScreen": {
          "zIndex": 1
        },
        "interactivity": {
          "events": {
            "onClick": {
              "mode": "push"
            },
            "onHover": {
              "mode": "repulse"
            }
          }
        },
        "particles": {
          "color": {
            "value": theme.palette.text.primary,
            "animation": {
              "h": {
                "enable": true,
                "speed": 20
              }
            }
          },
          "links": {
            "color": {
              "value": theme.palette.text.primary,
            },
            "enable": true,
            "opacity": 0.4
          },
          "move": {
            "enable": true,
            "gravity": {
              "acceleration": 3,
              "maxSpeed": 5
            },
            "path": {},

            "speed": 1,
            "spin": {}
          },
          "number": {
            "density": {
              "enable": true
            },
            "value": 80
          },
          "opacity": {
            "value": 0.5,
            "animation": {}
          },
          "size": {
            "value": {
              "min": 0.1,
              "max": 3
            },
            "animation": {}
          }
        }
      }}
    />
  );
}

export default Particle;
