import pygame
import sys
import os
import json
import datetime
import config
from audio_manager import audio

PERFIL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "perfil_data.json")

def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

STATS_DEFAULT = {
    "nombre": "Jugador",
    "hp_max": 280,
    "muertes": 0,
    "victorias": 0,
    "bosses_derrotados": 0,
    "nivel1_completado": False,
    "nivel2_completado": False,
    "tiempo_total": 0.0,
    "disparos_realizados": 0,
    "aciertos": 0,
    "monedas": 0,
    "skins_desbloqueadas": [],
}

stats = STATS_DEFAULT.copy()

def cargar_stats():
    global stats
    try:
        if os.path.exists(PERFIL_FILE):
            with open(PERFIL_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k in STATS_DEFAULT:
                    if k not in data:
                        data[k] = STATS_DEFAULT[k]
                stats = data
    except Exception as e:
        print(f"Error cargando stats: {e}")

def guardar_stats():
    try:
        with open(PERFIL_FILE, "w", encoding="utf-8") as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error guardando stats: {e}")

def run_perfil(screen, clock):
    audio.resume()
    cargar_stats()

    font_big = pygame.font.SysFont("Arial Black", 50)
    font_mid = pygame.font.SysFont("Arial Black", 28)
    font_small = pygame.font.SysFont("Arial", 24)
    font_val = pygame.font.SysFont("Arial", 26)

    running = True
    while running:
        clock.tick(config.FPS)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit(); sys.exit()
            if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                audio.play_sfx(config.BUTTON_SOUND)
                running = False

        screen.fill((20, 20, 40))

        title = font_big.render("PERFIL DEL JUGADOR", True, (0, 255, 200))
        shadow = font_big.render("PERFIL DEL JUGADOR", True, (0, 0, 0))
        screen.blit(shadow, (config.WIDTH//2 - title.get_width()//2 + 4, 34))
        screen.blit(title, (config.WIDTH//2 - title.get_width()//2, 30))

        panel = pygame.Rect(config.WIDTH//2 - 350, 120, 700, 400)
        pygame.draw.rect(screen, (30, 30, 60), panel, border_radius=20)
        pygame.draw.rect(screen, (0, 255, 200), panel, 3, border_radius=20)

        y = panel.y + 30
        x_label = panel.x + 40
        x_val = panel.x + 320

        items = [
            ("Nombre:", stats.get("nombre", "Jugador")),
            ("Vida Max:", str(stats.get("hp_max", 280))),
            ("Muertes:", str(stats.get("muertes", 0))),
            ("Victorias:", str(stats.get("victorias", 0))),
            ("Bosses Derrotados:", str(stats.get("bosses_derrotados", 0))),
            ("Nivel 1:", "Completado" if stats.get("nivel1_completado") else "Pendiente"),
            ("Nivel 2:", "Completado" if stats.get("nivel2_completado") else "Pendiente"),
            ("Tiempo Total:", f"{stats.get('tiempo_total', 0):.1f}s"),
            ("Disparos:", str(stats.get("disparos_realizados", 0))),
            ("Monedas:", str(stats.get("monedas", 0))),
        ]

        for label, val in items:
            lbl = font_small.render(label, True, (180, 180, 220))
            vl = font_val.render(val, True, (255, 255, 255))
            screen.blit(lbl, (x_label, y))
            screen.blit(vl, (x_val, y))
            y += 34

        hint = font_small.render("Pulsa ESC para volver", True, (255, 255, 255))
        screen.blit(hint, (config.WIDTH//2 - hint.get_width()//2, config.HEIGHT - 40))

        pygame.display.flip()