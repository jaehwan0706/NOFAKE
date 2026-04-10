import { Buffer } from 'buffer';
import * as process from 'process'; // process 패키지를 직접 사용하는 게 더 안전합니다.
import vm from 'vm-browserify';    // 아까 설치한 vm-browserify 가져오기

// 1. global 설정 (Node.js의 global을 브라우저의 window로 연결)
if (typeof window !== 'undefined') {
  window.global = window;
}

// 2. Buffer 설정
window.Buffer = window.Buffer || Buffer;

// 3. process 설정 
// 직접 만드는 것보다 패키지를 활용하되, 없는 기능만 보완합니다.
window.process = window.process || process;
if (!window.process.env) window.process.env = {};
if (!window.process.nextTick) {
  window.process.nextTick = function (fn) { setTimeout(fn, 0); };
}

// 4. 🔥 vm 설정 (Webpack 5 에러 해결의 핵심)
window.vm = window.vm || vm;

console.log("✅ Polyfills loaded: global, Buffer, process, and vm are ready.");