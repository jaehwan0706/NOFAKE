import { Buffer } from 'buffer';

// 1. global 설정 (일부 라이브러리가 global 키워드를 사용함)
window.global = window;

// 2. Buffer 설정
window.Buffer = window.Buffer || Buffer;

// 3. process 설정 
// 라이브러리에서 직접 가져오는 대신, 브라우저가 필요한 최소한의 구조를 직접 만듭니다.
window.process = window.process || {
  env: { DEBUG: undefined },
  version: '',
  nextTick: function(fn) { setTimeout(fn, 0); }
};