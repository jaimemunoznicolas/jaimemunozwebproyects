import pygame
import sys
import os
import config
from audio_manager import audio

def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

VERSIONES = [
    ("v1.0", [
        "Primer lanzamiento público.",
        "Menú principal funcional con animaciones.",
        "Sistema de skins básico (personajes y aviones).",
        "Nivel 1 completamente jugable (estilo Geometry Dash).",
        "Sistema de bosses inicial (Ruth, Netanyahu, Falete, Diddy).",
        "Selector de niveles con scroll.",
        "Música de menú aleatoria.",
    ]),
    ("v1.1", [
        "Añadido sistema de perfiles con estadísticas persistentes.",
        "Nivel 2 mejorado con cohetes, obstáculos y secciones.",
        "Corregido bug de portal duplicado en Nivel 1.",
        "Añadida barra de scroll en menú de bosses.",
        "Sistema de tutorial interactivo para bosses.",
        "Mejora en la física del modo ship (avión).",
        "Efectos de partículas en explosiones.",
        "Sonido de explosión personalizado por boss.",
    ]),
    ("v1.2", [
        "Añadido sistema de checkpoints en niveles.",
        "Fondo parallax en niveles para más profundidad.",
        "Modo contrarreloj en niveles completados.",
        "Estadísticas detalladas en perfil del jugador.",
        "Más de 10 bosses jugables.",
        "Sistema de monedas y logros.",
        "Optimización de rendimiento general.",
    ]),
]

def run_notas(screen, clock):
    audio.resume()

    font_title = pygame.font.SysFont("Arial Black", 56)
    font_ver = pygame.font.SysFont("Arial Black", 32)
    font_text = pygame.font.SysFont("Arial", 24)

    scroll = 0
    running = True

    CONTENT_TOP = 120
    CONTENT_BOTTOM = config.HEIGHT - 40
    CONTENT_HEIGHT = CONTENT_BOTTOM - CONTENT_TOP

    content_surface = pygame.Surface((config.WIDTH, 2000), pygame.SRCALPHA)

    def render_content():
        y = 20
        for version, cambios in VERSIONES:
            ver_txt = font_ver.render(version, True, (255, 255, 0))
            content_surface.blit(ver_txt, (80, y))
            y += 45

            for c in cambios:
                txt = font_text.render("- " + c, True, (220, 220, 220))
                content_surface.blit(txt, (120, y))
                y += 32

            y += 25

        return y

    total_content_height = render_content()

    max_scroll = 0
    min_scroll = -(total_content_height - CONTENT_HEIGHT)

    while running:
        clock.tick(config.FPS)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit(); sys.exit()

            if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                audio.play_sfx(config.BUTTON_SOUND)
                running = False

            if event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 4:
                    scroll += 40
                if event.button == 5:
                    scroll -= 40

        scroll = max(min_scroll, min(max_scroll, scroll))

        screen.fill((25, 25, 45))

        title = font_title.render("Notas de la versión", True, (0, 255, 200))
        shadow = font_title.render("Notas de la versión", True, (0, 0, 0))
        screen.blit(shadow, (config.WIDTH//2 - title.get_width()//2 + 4, 36))
        screen.blit(title, (config.WIDTH//2 - title.get_width()//2, 30))

        screen.blit(content_surface, (0, CONTENT_TOP), area=pygame.Rect(0, -scroll, config.WIDTH, CONTENT_HEIGHT))

        if total_content_height > CONTENT_HEIGHT:
            scrollbar_height = max(40, int(CONTENT_HEIGHT * (CONTENT_HEIGHT / total_content_height)))
            scrollbar_y = CONTENT_TOP + int((-scroll / (total_content_height - CONTENT_HEIGHT)) * (CONTENT_HEIGHT - scrollbar_height))
            pygame.draw.rect(screen, (60, 60, 60), (config.WIDTH - 22, CONTENT_TOP, 12, CONTENT_HEIGHT), border_radius=6)
            pygame.draw.rect(screen, (180, 180, 180), (config.WIDTH - 22, scrollbar_y, 12, scrollbar_height), border_radius=6)

        hint = font_text.render("ESC: volver | Rueda: desplazar", True, (180, 180, 220))
        screen.blit(hint, (config.WIDTH//2 - hint.get_width()//2, config.HEIGHT - 35))

        pygame.display.flip()