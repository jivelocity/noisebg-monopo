import * as THREE from 'three'
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import fragment from './shaders/fragment.glsl'
import fragment2 from './shaders/fragment2.glsl'
import vertex from './shaders/vertex.glsl'
import vertex2 from './shaders/vertex2.glsl'
import GUI from 'lil-gui'
import gsap from 'gsap'

import { DotScreenShader } from './CustomShader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

import _vite_plugin_require_transform_case1 from 'nice-color-palettes'

var colors = _vite_plugin_require_transform_case1

let indexColor = Math.floor(Math.random() * colors.length)

indexColor = { id: 10 }
let palette = colors[indexColor.id]
palette = palette.map((color) => new THREE.Color(`${color}`))
console.log(palette[2])
export default class Sketch {
	constructor(options) {
		this.wrapper = options.domElement
		this.width = this.wrapper.offsetWidth
		this.height = this.wrapper.offsetHeight
		this.cameraDirection = new THREE.Vector3()

		// Camera
		this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 1000)
		this.camera.position.set(-0.6, -0.1, 0.6)
		this.camera.lookAt(5.2, -7.2, -99.0)
		console.log(this.camera)
		this.camPositionSpan = document.querySelector('#position')
		this.camLookAtSpan = document.querySelector('#lookingAt')

		this.scene = new THREE.Scene()

		// Render
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		this.wrapper.appendChild(this.renderer.domElement)
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement)

		this.time = 0
		this.initPost()
		this.settings()
		this.resize()
		this.addObjects()
		this.render()

		this.setupResize()
	}

	settings() {
		this.settings = {
			// progress: 0,
			// progress1: 0,
			runAnimation: () => {
				this.runAnimation()
			},
		}

		this.gui = new GUI()
		// this.gui.add(this.settings, 'progress', 0, 1, 0.01)
		// this.gui.add(this.settings, 'progress1', 0, 1, 0.01).onChange((val) => {
		// 	this.effectPass.uniforms.uProgress.value = val
		// })

		this.gui.add(this.settings, 'runAnimation')
	}

	runAnimation() {
		let tl = gsap.timeline()
		tl.to(
			this.camera.position,
			{
				x: -0.6,
				y: -0.1,
				z: 0.6,
				duration: 1.5,
				ease: 'power4.inOut',
			},
			0
		)
		tl.to(
			this.camera.position,
			{
				x: 0.6,
				y: -0.1,
				z: 0.5,
				duration: 1,
				ease: 'power4.inOut',
			},
			1
		)
		tl.to(this.camera.position, {
			x: 0.2,
			y: 0,
			z: 0.1,
			duration: 1,
			ease: 'power4.inOut',
		})
		tl.to(this.camera.position, {
			x: -0.6,
			y: -0.1,
			z: 0.4,
			duration: 1.5,
			ease: 'power4.inOut',
		})

		tl.to(
			this.camera.lookAt,
			{
				x: 5.2,
				y: -7.2,
				z: -99.0,
			},
			0
		)

		tl.to(
			this.camera.lookAt,
			{
				x: 3.2,
				y: -7.2,
				z: -89.0,
			},
			1
		)

		console.log(this.camera.position.set)
	}

	initPost() {
		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(new RenderPass(this.scene, this.camera))

		const effect1 = new ShaderPass(DotScreenShader)
		effect1.uniforms['scale'].value = 4
		this.composer.addPass(effect1)
	}

	resize() {
		this.width = this.wrapper.offsetWidth
		this.height = this.wrapper.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.composer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height
		this.camera.updateProjectionMatrix()
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	// Object
	addObjects() {
		this.CubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
			format: THREE.RGBAFormat,
			generateMipmaps: true,
			minFilter: THREE.LinearMipMapLinearFilter,
			encoding: THREE.sRGBEncoding,
		})

		this.cubeCamera = new THREE.CubeCamera(0.1, 10, this.CubeRenderTarget)

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 1.0 },
				resolution: { value: new THREE.Vector4() },
				uColor: { value: palette },
			},
			vertexShader: vertex,
			fragmentShader: fragment,
			side: THREE.DoubleSide,
			// wireframe: true,
		})

		// this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)

		this.geometry = new THREE.SphereGeometry(1.5, 32, 32)
		// this.material = new THREE.MeshNormalMaterial()

		this.mesh = new THREE.Mesh(this.geometry, this.material)
		this.scene.add(this.mesh)

		let smallSphereGeometry = new THREE.SphereGeometry(0.4, 32, 32)

		this.smallSphereMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 1.0 },
				tCube: { value: 0 },
				resolution: { value: new THREE.Vector4() },
				uColor: { value: palette },
			},
			vertexShader: vertex2,
			fragmentShader: fragment2,
			side: THREE.DoubleSide,
			// wireframe: true,
		})

		this.smallSphere = new THREE.Mesh(smallSphereGeometry, this.smallSphereMaterial)
		this.scene.add(this.smallSphere)
		console.log(this.smallSphere)
	}

	//Render Animation

	render() {
		this.time += 0.01
		this.smallSphere.visible = false
		this.cubeCamera.update(this.renderer, this.scene)
		this.smallSphere.visible = true
		this.smallSphereMaterial.uniforms.tCube.value = this.CubeRenderTarget.texture
		this.material.uniforms.time.value = this.time
		this.mesh.rotation.x = this.time / 2000
		this.mesh.rotation.y = this.time / 1000

		this.camera.getWorldDirection(this.cameraDirection)
		// scale the unit vector up to get a more intuitive value
		this.cameraDirection.set(
			this.cameraDirection.x * 100,
			this.cameraDirection.y * 100,
			this.cameraDirection.z * 100
		)
		// update the onscreen spans with the camera's position and lookAt vectors
		this.camPositionSpan.innerHTML = `Position: (${this.camera.position.x.toFixed(
			1
		)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)})`
		this.camLookAtSpan.innerHTML = `LookAt: (${(
			this.camera.position.x + this.cameraDirection.x
		).toFixed(1)}, ${(this.camera.position.y + this.cameraDirection.y).toFixed(1)}, ${(
			this.camera.position.z + this.cameraDirection.z
		).toFixed(1)})`

		// this.renderer.render(this.scene, this.camera)
		this.composer.render(this.scene, this.camera)
		window.requestAnimationFrame(this.render.bind(this))
	}
}

new Sketch({
	domElement: document.getElementById('wrapper'),
})
