import pygame
import math
import random
import config
import sys
import os
from audio_manager import audio
import perfil

def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

skin_img = None
plane_skin_img = None
bg_image = None
SPIKE_IMG = None
SAW_IMG = None
saw_img = None
PORTAL_IMG = None
FINAL_IMG = None
FINAL_WALL_IMG = None
BLOCK_IMG = None
ROCKET_IMG = None
FIRE_FRAMES = []
COHETE_SFX = None
COHETE_LOOP = None

def load_skin():
    path = config.get_selected_character_skin_path()
    if path is None or not os.path.exists(resource_path(path)):
        return None
    try:
        img = pygame.image.load(resource_path(path)).convert_alpha()
        img = pygame.transform.scale(img, (config.PLAYER_SIZE, config.PLAYER_SIZE))
        return img
    except Exception:
        return None

def load_plane_skin():
    path = config.get_selected_plane_skin_path()
    if path is None or not os.path.exists(resource_path(path)):
        return None
    try:
        img = pygame.image.load(resource_path(path)).convert_alpha()
        img = pygame.transform.scale(img, (config.PLAYER_SIZE + 20, config.PLAYER_SIZE))
        return img
    except Exception:
        return None

def load_bg():
    bg_path = resource_path("assets/images/fondo_level2.png")
    if not os.path.exists(bg_path):
        print("No se encontró fondo_level2.png")
        return None
    try:
        img = pygame.image.load(bg_path).convert()
        img = pygame.transform.smoothscale(img, (config.WIDTH, config.HEIGHT))
        return img
    except Exception as e:
        print("Error cargando fondo:", e)
        return None

class Particle:
    def __init__(self, x, y, color, speed_mult=1.0):
        self.x, self.y = x, y
        self.vx = random.uniform(-3, 3) * speed_mult
        self.vy = random.uniform(-6, -1) * speed_mult
        self.life = random.randint(30, 70)
        self.max_life = self.life
        self.color = color
        self.size = random.randint(3, 6)

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.vy += 0.25
        self.life -= 1

    def draw(self, surface):
        alpha = max(0, int(255 * (self.life / self.max_life)))
        s = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        s.fill((*self.color, alpha))
        surface.blit(s, (self.x, self.y))

class Player:
    def __init__(self, start_x):
        self.start_x = start_x
        self.rect = pygame.Rect(start_x, config.GROUND_Y - config.PLAYER_SIZE,
                                config.PLAYER_SIZE, config.PLAYER_SIZE)
        self.vel_y = 0.0
        self.rotation = 0.0
        self.gravity_dir = 1
        self.alive = True
        self.trail = []
        self.jump_held = False
        self.mode = "cube"
        self.ship_speed_y = 4.0
        self.on_platform = False
        self.on_ground_flag = False

    def on_ground(self):
        return (
            self.mode == "cube"
            and (self.rect.bottom >= config.GROUND_Y or self.on_platform)
        )

    def update(self):
        if not self.alive:
            return
        if self.mode == "cube":
            self.vel_y += config.GRAVITY
            self.rect.y += self.vel_y
            if self.rect.bottom >= config.GROUND_Y:
                self.rect.bottom = config.GROUND_Y
                self.vel_y = 0
                self.on_ground_flag = True
                self.rotation = round(self.rotation / 90) * 90
            else:
                self.on_ground_flag = False
            if self.vel_y != 0:
                self.rotation -= 6
            if self.jump_held and self.on_ground_flag:
                self.jump()
        elif self.mode == "ship":
            if self.jump_held:
                self.rect.y -= self.ship_speed_y
                self.rotation = min(self.rotation + 4, 45)
            else:
                self.rect.y += self.ship_speed_y
                self.rotation = max(self.rotation - 4, -45)
            if not self.jump_held:
                if self.rotation > 0:
                    self.rotation -= 1
                elif self.rotation < 0:
                    self.rotation += 1
            if self.rect.top < 0:
                self.rect.top = 0
            if self.rect.bottom > config.GROUND_Y:
                self.rect.bottom = config.GROUND_Y
        self.trail.append(self.rect.center)
        if len(self.trail) > 12:
            self.trail.pop(0)

    def jump(self):
        if self.mode != "cube":
            return False
        if self.rect.bottom >= config.GROUND_Y or self.on_platform:
            self.vel_y = -config.JUMP_FORCE
            return True
        return False

    def draw(self, surface):
        for i, pos in enumerate(self.trail):
            alpha = int(120 * (i / len(self.trail)))
            size = config.PLAYER_SIZE - (len(self.trail) - i) * 1.5
            s = pygame.Surface((size, size), pygame.SRCALPHA)
            s.fill((0, 255, 200, alpha))
            surface.blit(s, s.get_rect(center=pos))
        if self.mode == "ship" and plane_skin_img:
            rotated_plane = pygame.transform.rotate(plane_skin_img, self.rotation)
            plane_rect = rotated_plane.get_rect(center=self.rect.center)
            surface.blit(rotated_plane, plane_rect)
            if skin_img:
                rotated_player = pygame.transform.rotate(skin_img, self.rotation)
            else:
                cube = pygame.Surface((config.PLAYER_SIZE, config.PLAYER_SIZE), pygame.SRCALPHA)
                cube.fill((0, 255, 200))
                pygame.draw.rect(cube, config.C_TEXT, cube.get_rect(), 3)
                rotated_player = pygame.transform.rotate(cube, self.rotation)
            player_rect = rotated_player.get_rect(center=(self.rect.centerx, self.rect.centery - 25))
            surface.blit(rotated_player, player_rect)
            return
        if skin_img:
            rotated = pygame.transform.rotate(skin_img, self.rotation)
        else:
            cube = pygame.Surface((config.PLAYER_SIZE, config.PLAYER_SIZE), pygame.SRCALPHA)
            cube.fill((0, 255, 200))
            pygame.draw.rect(cube, config.C_TEXT, cube.get_rect(), 3)
            rotated = pygame.transform.rotate(cube, self.rotation)
        surface.blit(rotated, rotated.get_rect(center=self.rect.center))

class GameObject:
    def __init__(self, x, y, w, h, kind="generic"):
        self.rect = pygame.Rect(x, y, w, h)
        self.kind = kind
        self.passed = False
        self.move_axis = None
        self.move_range = 0
        self.move_origin = (self.rect.x, self.rect.y)
        self.move_speed = 0.002 * random.uniform(0.8, 1.2)

    def update(self, speed):
        self.rect.x -= speed
        if self.move_axis == 'y':
            offset = math.sin(pygame.time.get_ticks() * self.move_speed + self.rect.x * 0.01) * self.move_range
            self.rect.y = int(self.move_origin[1] + offset)
        elif self.move_axis == 'x':
            offset = math.sin(pygame.time.get_ticks() * self.move_speed + self.rect.y * 0.01) * self.move_range
            self.rect.x = int(self.move_origin[0] + offset) - speed

    def draw(self, surface):
        if self.kind == "end":
            pygame.draw.rect(surface, (0, 200, 0), self.rect)
            pygame.draw.rect(surface, (0, 0, 0), self.rect, 3)
        elif self.kind == "jump_pad":
            pygame.draw.rect(surface, (0, 180, 255), self.rect, border_radius=6)
            pygame.draw.rect(surface, (0, 0, 0), self.rect, 2, border_radius=6)
            cx, cy = self.rect.center
            pygame.draw.polygon(surface, (255, 255, 255), [(cx-6, cy+6), (cx+6, cy+6), (cx, cy-6)])
        elif self.kind == "portal":
            color = (200, 80, 255)
            pygame.draw.ellipse(surface, color, self.rect, 5)
        else:
            pygame.draw.rect(surface, (120, 120, 120), self.rect)
            pygame.draw.rect(surface, (0, 0, 0), self.rect, 2)

class Spike(GameObject):
    def __init__(self, x, y_offset=0, inverted=False):
        y = config.GROUND_Y - 40 - y_offset if not inverted else y_offset
        super().__init__(x, y, 40, 40, kind="spike")
        self.inverted = inverted

    def draw(self, surface):
        if self.inverted:
            img = pygame.transform.flip(SPIKE_IMG, False, True)
        else:
            img = SPIKE_IMG
        surface.blit(img, self.rect)

class FinalWall(GameObject):
    def __init__(self, x):
        super().__init__(x, 0, 1000, config.GROUND_Y, kind="final_wall")

    def draw(self, surface):
        if FINAL_WALL_IMG:
            surface.blit(FINAL_WALL_IMG, self.rect)
        else:
            pygame.draw.rect(surface, (0, 0, 0), self.rect)

class Saw(GameObject):
    def __init__(self, x, y):
        super().__init__(x, y, 60, 60, kind="saw")
        self.angle = random.randint(0, 360)

    def update(self, speed):
        super().update(speed)
        self.angle += 12

    def draw(self, surface):
        rotated = pygame.transform.rotate(saw_img, self.angle)
        rect = rotated.get_rect(center=self.rect.center)
        surface.blit(rotated, rect)

class MovingSaw(GameObject):
    def __init__(self, x, y, range_y=80):
        super().__init__(x, y, 60, 60, kind="movingsaw")
        self.angle = 0
        self.move_range = range_y
        self.move_origin = (self.rect.x, self.rect.y)

    def update(self, speed):
        super().update(speed)
        self.angle += 14
        t = pygame.time.get_ticks() / 300
        offset = math.sin(t) * self.move_range
        self.rect.y = self.move_origin[1] + offset

    def draw(self, surface):
        rotated = pygame.transform.rotate(SAW_IMG, self.angle)
        rect = rotated.get_rect(center=self.rect.center)
        surface.blit(rotated, rect)

class JumpPad(GameObject):
    def __init__(self, x, y, power=1.4):
        super().__init__(x, y, 40, 20, kind="jump_pad")
        self.power = power

    def draw(self, surface):
        pygame.draw.rect(surface, (0, 180, 255), self.rect, border_radius=6)
        pygame.draw.rect(surface, (0, 0, 0), self.rect, 2, border_radius=6)
        cx, cy = self.rect.center
        pygame.draw.polygon(surface, (255, 255, 255), [(cx-6, cy+6), (cx+6, cy+6), (cx, cy-6)])

class Portal(GameObject):
    def __init__(self, x, y, portal_type="in"):
        super().__init__(x, y - 40, 50, 160, kind="portal")
        self.portal_type = portal_type
        self.used = False

    def draw(self, surface):
        rect = PORTAL_IMG.get_rect(center=self.rect.center)
        surface.blit(PORTAL_IMG, rect)

class Rocket(GameObject):
    def __init__(self, x, y, trigger_x, speed=8):
        super().__init__(x, y, 50, 20, kind="rocket")
        self.speed = speed
        self.trigger_x = trigger_x
        self.active = False
        self.image = ROCKET_IMG
        self.fire_index = 0
        self.fire_speed = 0.25
        self.exploded = False
        self.dx = math.cos(math.radians(45))
        self.dy = math.sin(math.radians(45))

    def update(self, scroll_speed):
        self.rect.x -= scroll_speed
        self.fire_index += self.fire_speed
        if self.fire_index >= len(FIRE_FRAMES):
            self.fire_index = 0
        if not self.active:
            return
        self.rect.x -= self.speed * 1.2
        self.rect.y += self.speed * 1.4
        if self.rect.bottom >= config.GROUND_Y:
            self.rect.bottom = config.GROUND_Y
            self.exploded = True
            return

    def draw(self, surface):
        if self.image:
            surface.blit(self.image, self.rect)
            if FIRE_FRAMES:
                fire_img = FIRE_FRAMES[int(self.fire_index)]
                fire_x = self.rect.x + 60
                fire_y = self.rect.y - 40
                surface.blit(fire_img, (fire_x, fire_y))
        else:
            pygame.draw.rect(surface, (255, 80, 0), self.rect)
            pygame.draw.rect(surface, (0, 0, 0), self.rect, 2)

class Block(GameObject):
    def __init__(self, x, y, w=60, h=60):
        super().__init__(x, y, w, h, kind="block")
        self.image = BLOCK_IMG

    def draw(self, surface):
        if self.image:
            surface.blit(self.image, self.rect)
        else:
            pygame.draw.rect(surface, (150, 100, 50), self.rect)
            pygame.draw.rect(surface, (0, 0, 0), self.rect, 2)

class Platform(GameObject):
    def __init__(self, x, y, w, h):
        super().__init__(x, y, w, h, kind="platform")

    def draw(self, surface):
        pygame.draw.rect(surface, (180, 180, 180), self.rect)
        pygame.draw.rect(surface, (0, 0, 0), self.rect, 2)

class Checkpoint(GameObject):
    def __init__(self, x):
        super().__init__(x, config.GROUND_Y - 60, 30, 60, kind="checkpoint")
        self.activated = False
        self.pulse = 0

    def draw(self, surface):
        self.pulse += 0.1
        glow = int(80 + 60 * math.sin(self.pulse))
        color = (0, glow, 200) if not self.activated else (0, 255, 0)
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        pygame.draw.rect(surface, (255, 255, 255), self.rect, 2, border_radius=8)

try:
    BLOCK_IMG = pygame.image.load(resource_path("assets/images/block.png")).convert_alpha()
    BLOCK_IMG = pygame.transform.scale(BLOCK_IMG, (60, 60))
except:
    BLOCK_IMG = None

def generate_level():
    objects = []

    # --- SECCIÓN INICIAL: plataformas y spikes ---
    objects.append(Platform(600, config.GROUND_Y - 40, 200, 40))
    objects.append(Spike(900, 0))
    objects.append(Spike(950, 0))
    objects.append(Platform(1100, config.GROUND_Y - 100, 150, 40))
    objects.append(Spike(1300, 60))

    # --- OLEADA DE COHETES ---
    objects.append(Rocket(1600, 50, trigger_x=500, speed=9))
    objects.append(Rocket(1900, 50, trigger_x=1700, speed=9))
    objects.append(Rocket(2400, 180, trigger_x=2200, speed=9))
    objects.append(Rocket(3000, 50, trigger_x=2800, speed=9))
    objects.append(Rocket(3600, 50, trigger_x=3400, speed=9))
    objects.append(Rocket(4200, 160, trigger_x=4000, speed=9))
    objects.append(Rocket(4800, 50, trigger_x=4600, speed=9))
    objects.append(Rocket(5400, 50, trigger_x=5200, speed=9))

    # --- SECCIÓN BLOQUES Y PLATAFORMAS ---
    for x in range(6000, 6300, 60):
        objects.append(Block(x, config.GROUND_Y - 60))
    objects.append(Spike(6400, 0))
    objects.append(Spike(6450, 0))
    objects.append(Platform(6600, config.GROUND_Y - 120, 200, 40))
    objects.append(MovingSaw(6900, config.GROUND_Y - 80))
    objects.append(Spike(7100, 0))

    # --- PORTAL 1: A SHIP ---
    portal1_x = 7500
    portal1_y = config.GROUND_Y - 90
    objects.append(Portal(portal1_x, portal1_y, "in"))
    for i in range(6):
        objects.append(Saw(portal1_x, portal1_y - 80 - i * 80))

    # --- SHIP SECTION ---
    objects.append(Spike(7700, 0))
    objects.append(Spike(7750, 0))
    objects.append(MovingSaw(8000, config.GROUND_Y - 120))
    objects.append(Spike(8200, 0))
    objects.append(Spike(8250, 0))
    objects.append(MovingSaw(8500, config.GROUND_Y - 180))
    objects.append(Spike(8700, 0))

    # --- PORTAL 2: A CUBE ---
    portal2_x = 9000
    portal2_y = config.GROUND_Y - 90
    objects.append(Portal(portal2_x, portal2_y, "out"))
    for i in range(6):
        objects.append(Saw(portal2_x, portal2_y - 80 - i * 80))

    # --- SECCIÓN DE COHETES MIX ---
    objects.append(Rocket(9600, 50, trigger_x=9400, speed=9))
    objects.append(Rocket(10200, 50, trigger_x=10000, speed=9))
    objects.append(Rocket(10800, 170, trigger_x=10600, speed=9))

    # --- SECCIÓN PLATAFORMAS ALTAS ---
    objects.append(Platform(10500, config.GROUND_Y - 160, 180, 40))
    objects.append(Platform(11000, config.GROUND_Y - 240, 160, 40))
    objects.append(MovingSaw(11500, config.GROUND_Y - 160))
    objects.append(Spike(11800, 0))

    # --- SECCIÓN DE BLOQUES OBSTÁCULO ---
    for x in range(12000, 12300, 60):
        objects.append(Block(x, config.GROUND_Y - 60))
    objects.append(Spike(12400, 0))
    objects.append(Spike(12450, 0))
    objects.append(MovingSaw(12600, config.GROUND_Y - 140))

    # --- COHETES FINALES ---
    objects.append(Rocket(13000, 50, trigger_x=12800, speed=10))
    objects.append(Rocket(13400, 50, trigger_x=13200, speed=10))
    objects.append(Rocket(13800, 160, trigger_x=13600, speed=10))
    objects.append(Rocket(14200, 50, trigger_x=14000, speed=10))
    objects.append(Rocket(14600, 50, trigger_x=14400, speed=10))

    # --- SPIKES FINALES ---
    for x in range(15000, 15300, 50):
        objects.append(Spike(x, 0))
    objects.append(MovingSaw(15500, config.GROUND_Y - 120))
    objects.append(Spike(15800, 0))
    objects.append(Spike(15850, 0))

    # --- PORTAL 3: A SHIP (FINAL) ---
    portal3_x = 16200
    portal3_y = config.GROUND_Y - 90
    objects.append(Portal(portal3_x, portal3_y, "in"))
    for i in range(6):
        objects.append(Saw(portal3_x, portal3_y - 80 - i * 80))

    # --- FINAL SHIP SECTION ---
    objects.append(Spike(16400, 0))
    objects.append(MovingSaw(16700, config.GROUND_Y - 150))
    objects.append(Spike(17000, 0))
    objects.append(MovingSaw(17300, config.GROUND_Y - 120))
    objects.append(Spike(17600, 0))

    # --- PORTAL 4: A CUBE FINAL ---
    portal4_x = 18000
    portal4_y = config.GROUND_Y - 90
    objects.append(Portal(portal4_x, portal4_y, "out"))
    for i in range(6):
        objects.append(Saw(portal4_x, portal4_y - 80 - i * 80))

    # --- SPRINT FINAL ---
    for x in range(18300, 18600, 50):
        objects.append(Spike(x, 0))
    objects.append(MovingSaw(18800, config.GROUND_Y - 120))

    end_x = 19500
    objects.append(FinalWall(end_x))

    total_distance_real = end_x - 200
    return objects, end_x, total_distance_real, [8000, 14000]

def spawn_particles(particles, x, y, color, count=30, speed=1.0):
    for _ in range(count):
        particles.append(Particle(x + random.uniform(-12, 12), y + random.uniform(-12, 12), color, speed))

def run_level(screen, clock):
    global skin_img, plane_skin_img, bg_image
    global SPIKE_IMG, SAW_IMG, saw_img, PORTAL_IMG, FINAL_IMG, FINAL_WALL_IMG, BLOCK_IMG, ROCKET_IMG
    global COHETE_SFX, COHETE_LOOP

    skin_img = load_skin()
    plane_skin_img = load_plane_skin()
    bg_image = load_bg()

    try:
        ROCKET_IMG = pygame.image.load(resource_path("assets/images/rocket_level2.png")).convert_alpha()
        ROCKET_IMG = pygame.transform.scale(ROCKET_IMG, (120, 60))
    except:
        ROCKET_IMG = None

    global FIRE_FRAMES
    FIRE_FRAMES = []
    for i in range(4):
        try:
            img = pygame.image.load(resource_path(f"assets/images/fire_{i}.png")).convert_alpha()
            img = pygame.transform.scale(img, (60, 60))
            FIRE_FRAMES.append(img)
        except:
            pass

    font_pct = pygame.font.SysFont("Arial Black", 28)

    SPIKE_IMG = pygame.image.load(resource_path("assets/images/level2_spike.png")).convert_alpha()
    SPIKE_IMG = pygame.transform.scale(SPIKE_IMG, (70, 70))

    GROUND_IMG = pygame.image.load(resource_path("assets/images/level2_floor.png")).convert_alpha()
    GROUND_IMG = pygame.transform.smoothscale(GROUND_IMG, (config.WIDTH, config.HEIGHT - config.GROUND_Y))

    SAW_IMG = pygame.image.load(resource_path("assets/images/level1_motioncirclespike.png")).convert_alpha()
    SAW_IMG = pygame.transform.scale(SAW_IMG, (70, 70))

    saw_img = pygame.image.load(resource_path("assets/images/level1_circlespike.gif")).convert_alpha()
    saw_img = pygame.transform.scale(saw_img, (70, 70))

    PORTAL_IMG = pygame.image.load(resource_path("assets/images/level2_portal.png")).convert_alpha()
    PORTAL_IMG = pygame.transform.scale(PORTAL_IMG, (90, 120))

    FINAL_IMG = pygame.image.load(resource_path("assets/images/final_level1-removebg.png")).convert_alpha()
    FINAL_IMG = pygame.transform.scale(FINAL_IMG, (180, 260))

    FINAL_WALL_IMG = pygame.image.load(resource_path("assets/images/final_wall.jpg")).convert_alpha()
    FINAL_WALL_IMG = pygame.transform.scale(FINAL_WALL_IMG, (1000, config.GROUND_Y))

    COHETE_SFX = pygame.mixer.Sound(resource_path("assets/audio/sound_rocket.mp3"))
    COHETE_SFX.set_volume(0.8)
    COHETE_LOOP = pygame.mixer.Sound(resource_path("assets/audio/explosion_rocket.mp3"))
    COHETE_LOOP.set_volume(0.5)

    player = Player(start_x=150)
    objects, end_x, total_distance, checkpoint_positions = generate_level()

    for cp_x in checkpoint_positions:
        objects.append(Checkpoint(cp_x))

    final_rect = FINAL_IMG.get_rect()
    final_rect.midbottom = (end_x, config.GROUND_Y)

    distance_traveled = 0
    scroll_x = 0
    progress = 0
    state = "PLAY"
    last_checkpoint_pos = None
    last_checkpoint_obj = None

    SCROLL_SPEED = config.SCROLL_SPEED
    particles = []

    music_path = resource_path(config.LEVEL2_MUSIC)
    if os.path.exists(music_path):
        try:
            pygame.mixer.music.load(music_path)
            pygame.mixer.music.set_volume(0.6)
            pygame.mixer.music.play(-1)
        except:
            pass

    running = True
    while running:
        dt = clock.tick(config.FPS) / 1000.0
        scroll_speed = SCROLL_SPEED * dt

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                raise SystemExit

            if state == "PLAY":
                if event.type == pygame.KEYDOWN:
                    if event.key in (pygame.K_SPACE, pygame.K_UP):
                        player.jump_held = True
                        player.jump()
                    if event.key == pygame.K_ESCAPE:
                        pygame.mixer.music.pause()
                        state = "PAUSA"
                if event.type == pygame.KEYUP:
                    if event.key in (pygame.K_SPACE, pygame.K_UP):
                        player.jump_held = False
                if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                    player.jump_held = True
                    player.jump()
                if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                    player.jump_held = False

            elif state == "PAUSA":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        pygame.mixer.music.unpause()
                        state = "PLAY"
                    if event.key == pygame.K_ESCAPE:
                        pygame.mixer.music.stop()
                        return

            elif state == "GAMEOVER":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        if last_checkpoint_pos is not None:
                            player.__init__(start_x=last_checkpoint_pos)
                            state = "PLAY"
                            SCROLL_SPEED = config.SCROLL_SPEED
                            pygame.mixer.music.unpause()
                        else:
                            return run_level(screen, clock)
                    if event.key == pygame.K_ESCAPE:
                        running = False

            elif state == "WIN":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        return run_level(screen, clock)
                    if event.key == pygame.K_ESCAPE:
                        perfil.cargar_stats()
                        perfil.stats["victorias"] = perfil.stats.get("victorias", 0) + 1
                        perfil.stats["nivel2_completado"] = True
                        perfil.stats["tiempo_total"] = perfil.stats.get("tiempo_total", 0) + (pygame.time.get_ticks() / 1000)
                        perfil.guardar_stats()
                        running = False

        if state == "PLAY":
            player.update()
            for obj in objects:
                obj.update(scroll_speed)

            distance_traveled = min(distance_traveled + scroll_speed, total_distance)
            progress = min(100, (distance_traveled / total_distance) * 100)
            scroll_x += scroll_speed

            player.on_platform = False

            for obj in objects:
                if getattr(obj, "kind", None) == "checkpoint" and not getattr(obj, "activated", False):
                    if player.rect.colliderect(obj.rect):
                        obj.activated = True
                        last_checkpoint_pos = obj.rect.x + 100

                if getattr(obj, "kind", None) == "rocket":
                    if not obj.active and obj.rect.x <= player.rect.x + 600:
                        obj.active = True
                        COHETE_SFX.play()
                    if getattr(obj, "exploded", False):
                        COHETE_LOOP.play()
                        spawn_particles(particles, obj.rect.centerx, obj.rect.centery,
                                        (255, 120, 0), count=40, speed=1.5)
                        objects.remove(obj)
                        continue
                    if player.rect.colliderect(obj.rect):
                        COHETE_LOOP.play()
                        state = "GAMEOVER"
                        pygame.mixer.music.stop()
                        SCROLL_SPEED = 0
                        player.vel_y = 0

                if getattr(obj, "kind", None) == "platform":
                    if player.rect.colliderect(obj.rect):
                        if player.vel_y >= 0 and player.rect.bottom <= obj.rect.bottom:
                            player.rect.bottom = obj.rect.top
                            player.vel_y = 0
                            player.on_platform = True

                if getattr(obj, "kind", None) == "jump_pad":
                    if player.rect.colliderect(obj.rect) and player.vel_y >= 0:
                        player.vel_y = -config.JUMP_FORCE * getattr(obj, "power", 1.4)
                        player.on_platform = True

                if getattr(obj, "kind", None) == "block":
                    if player.rect.colliderect(obj.rect):
                        if player.vel_y >= 0 and player.rect.bottom <= obj.rect.top + 10:
                            player.rect.bottom = obj.rect.top
                            player.vel_y = 0
                            player.on_platform = True
                        elif player.rect.right > obj.rect.left and player.rect.left < obj.rect.left:
                            COHETE_LOOP.play()
                            state = "GAMEOVER"
                            pygame.mixer.music.stop()
                            SCROLL_SPEED = 0
                            player.vel_y = 0

                if getattr(obj, "kind", None) == "portal":
                    if player.rect.colliderect(obj.rect) and not getattr(obj, "used", False):
                        obj.used = True
                        if obj.portal_type == "in":
                            player.mode = "ship"
                            player.vel_y = 0
                            player.rotation = 0
                        elif obj.portal_type == "out":
                            player.mode = "cube"
                            player.vel_y = 0
                            player.rotation = 0

                if getattr(obj, "kind", None) in ("spike", "saw", "movingsaw"):
                    if player.rect.colliderect(obj.rect):
                        COHETE_LOOP.play()
                        state = "GAMEOVER"
                        pygame.mixer.music.stop()
                        SCROLL_SPEED = 0
                        player.vel_y = 0

                if getattr(obj, "kind", None) == "final_wall":
                    if progress >= 100 and player.rect.colliderect(obj.rect):
                        state = "WIN"
                        pygame.mixer.music.stop()
                        SCROLL_SPEED = 0
                        player.vel_y = 0

        if bg_image:
            parallax_speed = 0.3
            bg_offset = int(scroll_x * parallax_speed) % config.WIDTH
            screen.blit(bg_image, (-bg_offset, 0))
            screen.blit(bg_image, (config.WIDTH - bg_offset, 0))
        else:
            screen.fill(config.C_BG)
        screen.blit(GROUND_IMG, (0, config.GROUND_Y))

        for obj in objects:
            obj.draw(screen)

        player.draw(screen)
        screen.blit(FINAL_IMG, final_rect)

        for p in particles[:]:
            p.update()
            p.draw(screen)
            if p.life <= 0:
                particles.remove(p)

        bar_total_width = 400
        bar_height = 25
        bar_x = config.WIDTH // 2 - bar_total_width // 2
        bar_y = 20

        pygame.draw.rect(screen, (0, 0, 0), (bar_x, bar_y, bar_total_width, bar_height), 3)
        pygame.draw.rect(screen, (0, 255, 0), (bar_x, bar_y, int((progress / 100) * bar_total_width), bar_height))
        pct_text = font_pct.render(f"{int(progress)}%", True, (255, 255, 255))
        screen.blit(pct_text, (config.WIDTH // 2 - pct_text.get_width() // 2, bar_y + bar_height // 2 - pct_text.get_height() // 2))

        if state == "PAUSA":
            overlay = pygame.Surface((config.WIDTH, config.HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 180))
            screen.blit(overlay, (0, 0))
            font_big = pygame.font.SysFont(None, 80)
            text = font_big.render("PAUSA", True, (180, 180, 180))
            screen.blit(text, (config.WIDTH//2 - text.get_width()//2, config.HEIGHT//2 - 150))
            font_small = pygame.font.SysFont(None, 40)
            msg1 = font_small.render("ENTER - Continuar", True, (200, 200, 200))
            msg2 = font_small.render("ESC - Salir al menú", True, (200, 200, 200))
            screen.blit(msg1, (config.WIDTH//2 - msg1.get_width()//2, config.HEIGHT//2 - 20))
            screen.blit(msg2, (config.WIDTH//2 - msg2.get_width()//2, config.HEIGHT//2 + 40))

        if state == "GAMEOVER":
            overlay = pygame.Surface((config.WIDTH, config.HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 180))
            screen.blit(overlay, (0, 0))
            font_big = pygame.font.SysFont(None, 90)
            text = font_big.render("HAS PERDIDO", True, (255, 0, 0))
            screen.blit(text, (config.WIDTH//2 - text.get_width()//2, config.HEIGHT//2 - 150))
            font_small = pygame.font.SysFont(None, 40)
            msg = font_small.render("ENTER - Reintentar   |   ESC - Salir", True, (255, 255, 255))
            screen.blit(msg, (config.WIDTH//2 - msg.get_width()//2, config.HEIGHT//2 + 40))

        if state == "WIN":
            overlay = pygame.Surface((config.WIDTH, config.HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 180))
            screen.blit(overlay, (0, 0))
            font_big = pygame.font.SysFont(None, 90)
            text = font_big.render("HAS GANADO!", True, (0, 255, 0))
            screen.blit(text, (config.WIDTH//2 - text.get_width()//2, config.HEIGHT//2 - 150))
            font_small = pygame.font.SysFont(None, 40)
            msg = font_small.render("ENTER - Reintentar   |   ESC - Salir", True, (255, 255, 255))
            screen.blit(msg, (config.WIDTH//2 - msg.get_width()//2, config.HEIGHT//2 + 40))

        pygame.display.flip()
        audio.update()