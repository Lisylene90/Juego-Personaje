var juego = new Phaser.Game(370, 850, Phaser.CANVAS, 'bloque_juego');
var fondoJuego;
var personaje;
var teclaDerecha;
var teclaIzquierda;
var enemigos;
var balas;
var tiempoBala = 0;
var botonDisparo;
var puntos = 0;
var textoPuntos;
var textoFinal;
var sonidoLaser;

var estadoPrincipal = {

	preload: function () {
		juego.load.image('fondo', 'img1.png');
		juego.load.spritesheet('jugador', 'jugador.png', 128, 128);
		// enemigo.png mide 480x80: son 6 cuadros de 80x80
		juego.load.spritesheet('enemigo', 'enemigo.png', 80, 80);
		juego.load.image('laser', 'laser.png');

	},

	create: function () {
		fondoJuego = juego.add.tileSprite(0, 0, 370, 850, 'fondo');

		// Personaje jugador (anchor 0.5 = se posiciona desde su centro)
		personaje = juego.add.sprite(185, 760, 'jugador');
		personaje.anchor.setTo(0.5);
		personaje.animations.add('movimiento', [0, 1, 2, 3, 4, 5], 10, true);

		// ---------- DISPARO ----------
		botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		balas = juego.add.group();
		balas.enableBody = true;
		balas.physicsBodyType = Phaser.Physics.ARCADE;
		balas.createMultiple(20, 'laser');
		balas.setAll('anchor.x', 0.5);
		balas.setAll('anchor.y', 1);
		balas.setAll('outOfBoundsKill', true);
		balas.setAll('checkWorldBounds', true);

		// ---------- ENEMIGOS ----------
		enemigos = juego.add.group();
		enemigos.enableBody = true;
		enemigos.physicsBodyType = Phaser.Physics.ARCADE;
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 3; x++) {
				var enemig = enemigos.create(x * 90, y * 90, 'enemigo');
				enemig.anchor.setTo(0.5);
				enemig.animations.add('volar', [0, 1, 2, 3, 4, 5], 8, true);
				enemig.animations.play('volar');
			}
		}
		enemigos.x = 50;
		enemigos.y = 120;
		// Los enemigos se mueven de izquierda a derecha y regresan (yoyo)
		var animacion = juego.add.tween(enemigos).to(
			{ x: 140 },
			1000, Phaser.Easing.Linear.None, true, 0, 1000, true
		);

		// ---------- TEXTOS ----------
		textoPuntos = juego.add.text(10, 10, 'Puntos: 0', { font: 'bold 20px Arial', fill: '#ffffff' });
		textoFinal = juego.add.text(185, 400, '', { font: 'bold 32px Arial', fill: '#ffd700', align: 'center' });
		textoFinal.anchor.setTo(0.5);

		// Sonido del disparo (archivo laser.mp3 en la misma carpeta)
		sonidoLaser = new Audio('laser.mp3');

		teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	},

	update: function () {
		fondoJuego.tilePosition.x -= 1;

		// Movimiento del jugador (sin salir de la pantalla)
		if (teclaDerecha.isDown && personaje.x < juego.width - 40) {
			personaje.x += 3;
			personaje.animations.play('movimiento');
		} else if (teclaIzquierda.isDown && personaje.x > 40) {
			personaje.x -= 3;
			personaje.animations.play('movimiento');
		} else {
			personaje.animations.stop();
		}

		// Disparo: una bala cada 300 ms mientras se mantenga presionada la barra espaciadora
		var bala;
		if (botonDisparo.isDown) {
			if (juego.time.now > tiempoBala) {
				bala = balas.getFirstExists(false);
			}
			if (bala) {
				bala.reset(personaje.x, personaje.y - 50);
				bala.body.velocity.y = -400;
				tiempoBala = juego.time.now + 300;
				sonidoLaser.currentTime = 0;
				sonidoLaser.play();
			}
		}

		// Colisión de las balas con los enemigos
		juego.physics.arcade.overlap(balas, enemigos, colision, null, this);
	}
};

// Se ejecuta cuando una bala toca a un enemigo
function colision(bala, enemigo) {
	bala.kill();
	enemigo.kill();

	puntos += 10;
	textoPuntos.text = 'Puntos: ' + puntos;

	// Si ya no quedan enemigos vivos, se gana el juego
	if (enemigos.countLiving() === 0) {
		textoFinal.text = '¡Ganaste!\nPuntos: ' + puntos;
	}
}

juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');
