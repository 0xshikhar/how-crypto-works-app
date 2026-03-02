import type * as THREE from 'three'
import type { Object3DNode, ThreeElements } from '@react-three/fiber'

type ThreeLineElement = ThreeElements extends { threeLine: infer T }
    ? T
    : Object3DNode<THREE.Line, typeof THREE.Line>

declare module 'react' {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface IntrinsicElements extends ThreeElements {
            threeLine: ThreeLineElement
        }
    }
}

declare global {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface IntrinsicElements extends ThreeElements {
            threeLine: ThreeLineElement
        }
    }
}
