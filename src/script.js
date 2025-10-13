// 전역 변수들
let currentEquation = {};
let userInput = [];
let wrongAttempts = 0;
let selectedDirection = null;
let graphTransformations = { h: 0, k: 0 }; // h: 좌우이동, k: 상하이동
let graphAttempts = 0; // 그래프 이동 시도 횟수
let isRetryPhase = false; // 재시도 단계인지 여부
let currentLevel = 1; // 현재 레벨 (1 또는 2)
let selectedShape = null; // 선택된 개형

// 화면 관리
const screens = {
    main: document.getElementById('main-screen'),
    equation: document.getElementById('equation-screen'),
    graph: document.getElementById('graph-screen'),
    success: document.getElementById('success-screen')
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    try {
        // 캔버스 크기 설정
        resizeCanvas();
        
        // 윈도우 리사이즈 이벤트 리스너
        window.addEventListener('resize', resizeCanvas);
        
        // 이벤트 리스너 등록
        document.getElementById('start-level1-btn')?.addEventListener('click', () => startEquationChallenge(1));
        document.getElementById('start-level2-btn')?.addEventListener('click', () => startEquationChallenge(2));
        document.getElementById('check-answer-btn')?.addEventListener('click', checkAnswer);
        document.getElementById('clear-btn')?.addEventListener('click', clearUserInput);
        document.getElementById('add-number-btn')?.addEventListener('click', addNumber);
        document.getElementById('retry-same-level-btn')?.addEventListener('click', () => retryLevel());
        document.getElementById('try-other-level-btn')?.addEventListener('click', () => tryOtherLevel());
        document.getElementById('back-to-main-btn')?.addEventListener('click', () => resetToMain());
        document.getElementById('restart-equation-btn')?.addEventListener('click', () => restartCurrentEquation());
        document.getElementById('restart-graph-btn')?.addEventListener('click', () => restartCurrentEquation());
        document.getElementById('reset-graph-btn')?.addEventListener('click', resetGraph);
        document.getElementById('complete-movement-btn')?.addEventListener('click', checkGraphMovement);
        document.getElementById('check-multiplier-btn')?.addEventListener('click', checkMultiplier);
        
        // 블럭 버튼들 이벤트 리스너
        document.querySelectorAll('.block-btn').forEach(btn => {
            btn.addEventListener('click', () => addBlock(btn.dataset.value, btn.dataset.type));
        });
        
        // 방향 버튼들 이벤트 리스너
        document.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', () => selectDirection(btn.dataset.direction));
        });
        
        // 개형 선택 버튼들 이벤트 리스너
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', () => selectShape(btn.dataset.shape));
        });
        
        // 엔터키로 숫자 입력
        const numberInput = document.getElementById('number-input');
        if (numberInput) {
            numberInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addNumber();
                }
            });
        }
        
        // 엔터키로 이동량 입력
        const moveAmountInput = document.getElementById('move-amount');
        if (moveAmountInput) {
            moveAmountInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && selectedDirection) {
                    moveGraph();
                }
            });
        }
        
        // 엔터키로 배수 입력
        const multiplierInput = document.getElementById('multiplier-input');
        if (multiplierInput) {
            multiplierInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkMultiplier();
                }
            });
        }
        
        console.log('이차함수 학습 프로그램이 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('프로그램 초기화 중 오류 발생:', error);
    }
}

// 캔버스 크기 동적 조정
function resizeCanvas() {
    const canvas = document.getElementById('graph-canvas');
    if (canvas) {
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // 컨테이너 크기의 90%로 설정하되, 최대/최소 크기 제한
        const maxSize = Math.min(containerRect.width * 0.9, containerRect.height * 0.9);
        const size = Math.max(300, Math.min(600, maxSize));
        
        canvas.width = size;
        canvas.height = size;
        
        // 그래프가 그려져 있다면 다시 그리기
        if (currentEquation.a !== undefined) {
            const ctx = canvas.getContext('2d');
            drawCoordinateSystem(ctx, canvas, graphTransformations.h, graphTransformations.k);
            drawParabola(ctx, canvas, graphTransformations.h, graphTransformations.k, currentEquation.a || 1);
        }
    }
}

// 1. 이차방정식 도전 시작
function startEquationChallenge(level = 1) {
    currentLevel = level;
    generateRandomEquation();
    showScreen('equation');
    clearUserInput(); // resetUserInput() 대신 clearUserInput() 사용
    wrongAttempts = 0;
    hideFeedback();
}

// 2. 랜덤 이차방정식 생성
function generateRandomEquation() {
    let a, b, c;
    
    if (currentLevel === 1) {
        // Level 1: a = 1, b는 짝수로 고정
        a = 1;
        const evenNumbers = [-10, -8, -6, -4, -2, 2, 4, 6, 8, 10];
        b = evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
    } else {
        // Level 2: a는 1이 아닌 정수, b는 2a의 배수
        const aValues = [-4, -3, -2, 2, 3, 4, 5];
        a = aValues[Math.floor(Math.random() * aValues.length)];
        
        // b는 2a의 배수가 되도록 (2a, 4a, 6a, -2a, -4a, -6a 중 선택)
        const multipliers = [-3, -2, -1, 1, 2, 3];
        const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        b = 2 * a * multiplier;
    }
    
    // c는 -15부터 15까지의 정수
    c = Math.floor(Math.random() * 31) - 15;
    
    currentEquation = { a, b, c };
    
    // 완전제곱식 계산: ax² + bx + c = a(x + b/(2a))² + (c - b²/(4a))
    const h = -b/(2*a);  // (x - h)² 형태에서의 h (이동량)
    const k = c - (b*b)/(4*a);  // +k 형태에서의 k (상하이동)
    
    currentEquation.h = h;
    currentEquation.k = k;
    
    console.log(`생성된 방정식 (Level ${currentLevel}): ${a}x² + ${b}x + ${c}`);
    console.log(`완전제곱식: ${a}(x - ${h})² + ${k}`);
    console.log(`a = ${a}, h = ${h}, k = ${k}`);
    
    // 화면에 표시
    displayEquation();
}

// 방정식을 화면에 표시
function displayEquation() {
    const { a, b, c } = currentEquation;
    let equationText = '';
    
    if (currentLevel === 1) {
        // Level 1: x² + bx + c 형태
        equationText = 'x²';
        if (b > 0) {
            equationText += ` + ${b}x`;
        } else if (b < 0) {
            equationText += ` - ${Math.abs(b)}x`;
        }
        
        if (c > 0) {
            equationText += ` + ${c}`;
        } else if (c < 0) {
            equationText += ` - ${Math.abs(c)}`;
        }
    } else {
        // Level 2: ax² + bx + c 형태
        if (a === 1) {
            equationText = 'x²';
        } else if (a === -1) {
            equationText = '-x²';
        } else {
            equationText = `${a}x²`;
        }
        
        if (b > 0) {
            equationText += ` + ${b}x`;
        } else if (b < 0) {
            equationText += ` - ${Math.abs(b)}x`;
        }
        
        if (c > 0) {
            equationText += ` + ${c}`;
        } else if (c < 0) {
            equationText += ` - ${Math.abs(c)}`;
        }
    }
    
    document.getElementById('original-equation').textContent = equationText;
}

// 현재 방정식을 표준형 문자열로 변환
function convertToStandardForm(equation) {
    const { a, b, c } = equation;
    let equationText = '';
    
    // a 계수 처리
    if (a === 1) {
        equationText = 'x²';
    } else if (a === -1) {
        equationText = '-x²';
    } else {
        equationText = `${a}x²`;
    }
    
    // b 계수 처리
    if (b > 0) {
        equationText += ` + ${b}x`;
    } else if (b < 0) {
        equationText += ` - ${Math.abs(b)}x`;
    }
    
    // c 계수 처리
    if (c > 0) {
        equationText += ` + ${c}`;
    } else if (c < 0) {
        equationText += ` - ${Math.abs(c)}`;
    }
    
    return equationText;
}

// 3. 블럭 추가
function addBlock(value, type) {
    userInput.push({ value, type });
    updateCompletionDisplay();
}

// 숫자 입력 추가
function addNumber() {
    const input = document.getElementById('number-input');
    const value = input.value.trim();
    
    if (value) {
        userInput.push({ value, type: 'number' });
        updateCompletionDisplay();
        input.value = '';
    }
}

// 완성된 식 표시 업데이트
function updateCompletionDisplay() {
    const display = document.getElementById('completion-display');
    display.innerHTML = '';
    
    userInput.forEach((item, index) => {
        const span = document.createElement('span');
        span.className = 'equation-part';
        span.textContent = item.value;
        span.onclick = () => removeBlock(index);
        display.appendChild(span);
    });
    
    // 에러 표시 제거
    display.classList.remove('error');
    document.querySelectorAll('.equation-part').forEach(part => {
        part.classList.remove('error');
    });
}

// 블럭 제거
function removeBlock(index) {
    userInput.splice(index, 1);
    updateCompletionDisplay();
}

// 입력 내용 전체 지우기
function clearUserInput() {
    userInput = [];
    updateCompletionDisplay();
}

// 4. 답 확인
function checkAnswer() {
    const userAnswer = parseUserInput();
    const correctAnswer = getCurrentCorrectAnswer();
    
    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        showFeedback('맞습니다! 🎉', 'success');
        setTimeout(() => {
            startGraphChallenge();
        }, 2000);
    } else {
        wrongAttempts++;
        if (wrongAttempts === 1) {
            showFeedback('틀렸습니다. 다시 시도해보세요! 🤔', 'error');
        } else if (wrongAttempts >= 5) {
            // 5번 이상 틀리면 정답 공개
            const { a, h, k } = correctAnswer;
            let answerText = '';
            
            if (currentLevel === 2) {
                // Level 2: a(x±h)²±k 형태
                if (a === 1) {
                    answerText = '';
                } else if (a === -1) {
                    answerText = '-';
                } else {
                    answerText = `${a}`;
                }
                
                if (h === 0) {
                    answerText += 'x²';
                } else if (h > 0) {
                    answerText += `(x - ${h})²`;
                } else {
                    answerText += `(x + ${Math.abs(h)})²`;
                }
            } else {
                // Level 1: (x±h)²±k 형태
                if (h === 0) {
                    answerText = 'x²';
                } else if (h > 0) {
                    answerText = `(x - ${h})²`;
                } else {
                    answerText = `(x + ${Math.abs(h)})²`;
                }
            }
            
            if (k > 0) {
                answerText += ` + ${k}`;
            } else if (k < 0) {
                answerText += ` - ${Math.abs(k)}`;
            }
            
            showFeedback(`정답을 공개합니다: ${answerText} 😅 다시 입력해서 다음 단계로 진행하세요!`, 'warning');
            // 정답을 자동으로 채워주기
            setTimeout(() => {
                showCorrectAnswer(correctAnswer);
            }, 3000);
        } else {
            showFeedback('아직 수정할 부분이 있습니다. 빨간색 테두리를 확인해보세요! ❌', 'warning');
            highlightErrors(userAnswer, correctAnswer);
        }
    }
}

// 사용자 입력을 파싱
function parseUserInput() {
    const inputStr = userInput.map(item => item.value).join('');
    console.log('사용자 입력:', inputStr);
    
    const cleanInput = inputStr.replace(/\s/g, '');
    
    // 분수를 소수로 변환하는 함수
    function parseFraction(str) {
        if (str.includes('/')) {
            const [num, den] = str.split('/');
            return parseFloat(num) / parseFloat(den);
        }
        return parseFloat(str);
    }
    
    let match;
    
    if (currentLevel === 2) {
        // Level 2: a(x±p)²±q 형태 또는 a(x±p)² 형태
        // -a(x+p)² 형태 (상수항 없음, 음수 계수)
        match = cleanInput.match(/^-(\d+)\(x\+([^)]+)\)²$/);
        if (match) {
            const a = -parseFraction(match[1]);
            const p = parseFraction(match[2]);
            console.log('매칭된 패턴: -a(x+p)², a:', a, 'p:', p);
            return { a, h: -p, k: 0 };
        }
        
        // -a(x-p)² 형태 (상수항 없음, 음수 계수)
        match = cleanInput.match(/^-(\d+)\(x-([^)]+)\)²$/);
        if (match) {
            const a = -parseFraction(match[1]);
            const p = parseFraction(match[2]);
            console.log('매칭된 패턴: -a(x-p)², a:', a, 'p:', p);
            return { a, h: p, k: 0 };
        }
        
        // a(x+p)² 형태 (상수항 없음)
        match = cleanInput.match(/^(\d+)\(x\+([^)]+)\)²$/);
        if (match) {
            const a = parseFraction(match[1]);
            const p = parseFraction(match[2]);
            console.log('매칭된 패턴: a(x+p)², a:', a, 'p:', p);
            return { a, h: -p, k: 0 };
        }
        
        // a(x-p)² 형태 (상수항 없음)
        match = cleanInput.match(/^(\d+)\(x-([^)]+)\)²$/);
        if (match) {
            const a = parseFraction(match[1]);
            const p = parseFraction(match[2]);
            console.log('매칭된 패턴: a(x-p)², a:', a, 'p:', p);
            return { a, h: p, k: 0 };
        }
        
        // -(x+p)² 형태 (-1 계수, 상수항 없음)
        match = cleanInput.match(/^-\(x\+([^)]+)\)²$/);
        if (match) {
            const p = parseFraction(match[1]);
            console.log('매칭된 패턴: -(x+p)², p:', p);
            return { a: -1, h: -p, k: 0 };
        }
        
        // -(x-p)² 형태 (-1 계수, 상수항 없음)
        match = cleanInput.match(/^-\(x-([^)]+)\)²$/);
        if (match) {
            const p = parseFraction(match[1]);
            console.log('매칭된 패턴: -(x-p)², p:', p);
            return { a: -1, h: p, k: 0 };
        }
        
        // -(x+p)²-q 형태
        match = cleanInput.match(/^-\(x\+([^)]+)\)²-([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: -(x+p)²-q, p:', p, 'q:', q);
            return { a: -1, h: -p, k: -q };
        }
        
        // -(x+p)²+q 형태
        match = cleanInput.match(/^-\(x\+([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: -(x+p)²+q, p:', p, 'q:', q);
            return { a: -1, h: -p, k: q };
        }
        
        // -(x-p)²-q 형태
        match = cleanInput.match(/^-\(x-([^)]+)\)²-([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: -(x-p)²-q, p:', p, 'q:', q);
            return { a: -1, h: p, k: -q };
        }
        
        // -(x-p)²+q 형태
        match = cleanInput.match(/^-\(x-([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: -(x-p)²+q, p:', p, 'q:', q);
            return { a: -1, h: p, k: q };
        }
        
        // -a(x+p)²-q 형태
        match = cleanInput.match(/^-(\d+)\(x\+([^)]+)\)²-([^)]+)$/);
        if (match) {
            const a = -parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: -a(x+p)²-q, a:', a, 'p:', p, 'q:', q);
            return { a, h: -p, k: -q };
        }
        
        // -a(x+p)²+q 형태
        match = cleanInput.match(/^-(\d+)\(x\+([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const a = -parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: -a(x+p)²+q, a:', a, 'p:', p, 'q:', q);
            return { a, h: -p, k: q };
        }
        
        // -a(x-p)²-q 형태
        match = cleanInput.match(/^-(\d+)\(x-([^)]+)\)²-([^)]+)$/);
        if (match) {
            const a = -parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: -a(x-p)²-q, a:', a, 'p:', p, 'q:', q);
            return { a, h: p, k: -q };
        }
        
        // -a(x-p)²+q 형태
        match = cleanInput.match(/^-(\d+)\(x-([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const a = -parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: -a(x-p)²+q, a:', a, 'p:', p, 'q:', q);
            return { a, h: p, k: q };
        }
        
        // a(x+p)²-q 형태
        match = cleanInput.match(/^(\d+)\(x\+([^)]+)\)²-([^)]+)$/);
        if (match) {
            const a = parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: a(x+p)²-q, a:', a, 'p:', p, 'q:', q);
            return { a, h: -p, k: -q };
        }
        
        // a(x+p)²+q 형태
        match = cleanInput.match(/^(\d+)\(x\+([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const a = parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: a(x+p)²+q, a:', a, 'p:', p, 'q:', q);
            return { a, h: -p, k: q };
        }
        
        // a(x-p)²-q 형태
        match = cleanInput.match(/^(\d+)\(x-([^)]+)\)²-([^)]+)$/);
        if (match) {
            const a = parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: a(x-p)²-q, a:', a, 'p:', p, 'q:', q);
            return { a, h: p, k: -q };
        }
        
        // a(x-p)²+q 형태
        match = cleanInput.match(/^(\d+)\(x-([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const a = parseFraction(match[1]);
            const p = parseFraction(match[2]);
            const q = parseFraction(match[3]);
            console.log('매칭된 패턴: a(x-p)²+q, a:', a, 'p:', p, 'q:', q);
            return { a, h: p, k: q };
        }
    } else {
        // Level 1: (x±p)²±q 형태 또는 (x±p)² 형태
        // (x+p)² 형태 (상수항 없음)
        match = cleanInput.match(/^\(x\+([^)]+)\)²$/);
        if (match) {
            const p = parseFraction(match[1]);
            console.log('매칭된 패턴: (x+p)², p:', p);
            return { a: 1, h: -p, k: 0 };
        }
        
        // (x-p)² 형태 (상수항 없음)
        match = cleanInput.match(/^\(x-([^)]+)\)²$/);
        if (match) {
            const p = parseFraction(match[1]);
            console.log('매칭된 패턴: (x-p)², p:', p);
            return { a: 1, h: p, k: 0 };
        }
        
        // (x+p)²-q 형태
        match = cleanInput.match(/^\(x\+([^)]+)\)²-([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: (x+p)²-q, p:', p, 'q:', q);
            return { a: 1, h: -p, k: -q };
        }
        
        // (x+p)²+q 형태
        match = cleanInput.match(/^\(x\+([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: (x+p)²+q, p:', p, 'q:', q);
            return { a: 1, h: -p, k: q };
        }
        
        // (x-p)²-q 형태
        match = cleanInput.match(/^\(x-([^)]+)\)²-([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: (x-p)²-q, p:', p, 'q:', q);
            return { a: 1, h: p, k: -q };
        }
        
        // (x-p)²+q 형태
        match = cleanInput.match(/^\(x-([^)]+)\)²\+([^)]+)$/);
        if (match) {
            const p = parseFraction(match[1]);
            const q = parseFraction(match[2]);
            console.log('매칭된 패턴: (x-p)²+q, p:', p, 'q:', q);
            return { a: 1, h: p, k: q };
        }
    }
    
    console.log('매칭되지 않은 입력:', cleanInput);
    return null;
}

// 정답 계산
function getCurrentCorrectAnswer() {
    if (currentLevel === 2) {
        return {
            a: currentEquation.a,
            h: currentEquation.h,
            k: currentEquation.k
        };
    } else {
        return {
            a: 1,
            h: currentEquation.h,
            k: currentEquation.k
        };
    }
}

// 답이 맞는지 확인 (+ 음수와 - 양수를 같게 처리)
function isAnswerCorrect(userAnswer, correctAnswer) {
    if (!userAnswer) return false;
    
    console.log('사용자 답:', userAnswer);
    console.log('정답:', correctAnswer);
    
    // 분수 허용 오차를 조금 더 크게
    const tolerance = 0.01;
    
    let aCorrect = true;
    if (currentLevel === 2) {
        aCorrect = Math.abs(userAnswer.a - correctAnswer.a) < tolerance;
        console.log('a 맞음:', aCorrect, '(차이:', Math.abs(userAnswer.a - correctAnswer.a), ')');
    }
    
    const hCorrect = Math.abs(userAnswer.h - correctAnswer.h) < tolerance;
    const kCorrect = Math.abs(userAnswer.k - correctAnswer.k) < tolerance;
    
    console.log('h 맞음:', hCorrect, '(차이:', Math.abs(userAnswer.h - correctAnswer.h), ')');
    console.log('k 맞음:', kCorrect, '(차이:', Math.abs(userAnswer.k - correctAnswer.k), ')');
    
    return aCorrect && hCorrect && kCorrect;
}

// 에러 부분 하이라이트
function highlightErrors(userAnswer, correctAnswer) {
    const display = document.getElementById('completion-display');
    display.classList.add('error');
    
    // 간단한 에러 표시 - 실제로는 더 정교한 분석이 필요
    if (userAnswer && correctAnswer) {
        const parts = document.querySelectorAll('.equation-part');
        parts.forEach(part => {
            // 여기서는 간단히 모든 부분을 에러로 표시
            // 실제로는 더 정교한 에러 분석이 필요
            part.classList.add('error');
        });
    }
}

// 피드백 표시
function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove('hidden');
}

function hideFeedback() {
    document.getElementById('feedback').classList.add('hidden');
}

// 성공 메시지 표시 함수
function showSuccessMessage(message) {
    // 기존 성공 메시지가 있으면 제거
    const existingMessage = document.querySelector('.success-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 새로운 성공 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideDown 0.5s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideUp 0.5s ease-in';
            setTimeout(() => toast.remove(), 500);
        }
    }, 3000);
}

// 레벨 관련 새로운 함수들
function retryLevel() {
    startEquationChallenge(currentLevel);
}

function tryOtherLevel() {
    const otherLevel = currentLevel === 1 ? 2 : 1;
    startEquationChallenge(otherLevel);
}

function restartCurrentEquation() {
    // 현재 이차식을 유지하면서 처음부터 다시 시작
    showScreen('equation');
    clearUserInput(); // resetUserInput() 대신 clearUserInput() 사용
    wrongAttempts = 0;
    hideFeedback();
    // 현재 생성된 방정식 표시
    displayEquation();
}

function updateSuccessScreen() {
    const successMessage = document.getElementById('success-message');
    const otherLevelBtn = document.getElementById('try-other-level-btn');
    
    if (currentLevel === 1) {
        successMessage.textContent = 'Level 1을 완벽하게 마스터하셨습니다!';
        otherLevelBtn.textContent = '🚀 Level 2 도전하기';
    } else {
        successMessage.textContent = 'Level 2를 완벽하게 마스터하셨습니다!';
        otherLevelBtn.textContent = '📖 Level 1 도전하기';
    }
}

// 정답을 자동으로 채워주는 함수
function showCorrectAnswer(correctAnswer) {
    clearUserInput();
    const { a, h, k } = correctAnswer;
    
    if (currentLevel === 2 && a !== 1) {
        // Level 2에서 a가 1이 아닌 경우
        if (a === -1) {
            userInput.push({ value: '-', type: 'operator' });
        } else {
            userInput.push({ value: a.toString(), type: 'number' });
        }
    }
    
    // (x±h)² 부분
    userInput.push({ value: '(', type: 'parenthesis' });
    userInput.push({ value: 'x', type: 'variable' });
    
    if (h === 0) {
        // h가 0이면 아무것도 추가하지 않음
    } else if (h > 0) {
        userInput.push({ value: '-', type: 'operator' });
        userInput.push({ value: h.toString(), type: 'number' });
    } else {
        userInput.push({ value: '+', type: 'operator' });
        userInput.push({ value: Math.abs(h).toString(), type: 'number' });
    }
    
    userInput.push({ value: ')', type: 'parenthesis' });
    userInput.push({ value: '²', type: 'power' });
    
    // ±k 부분
    if (k > 0) {
        userInput.push({ value: '+', type: 'operator' });
        userInput.push({ value: k.toString(), type: 'number' });
    } else if (k < 0) {
        userInput.push({ value: '-', type: 'operator' });
        userInput.push({ value: Math.abs(k).toString(), type: 'number' });
    }
    
    updateCompletionDisplay();
    
    // 잠시 후 자동으로 다음 단계로 진행
    setTimeout(() => {
        startGraphChallenge();
    }, 2000);
}

// 5. 그래프 도전 시작
function startGraphChallenge() {
    showScreen('graph');
    graphTransformations = { h: 0, k: 0 };
    graphAttempts = 0;
    isRetryPhase = false;
    selectedShape = null;
    
    if (currentLevel === 1) {
        // Level 1: 배수/개형 선택 단계 완전히 숨기고 바로 평행이동 단계
        const shapeStep = document.getElementById('shape-selection-step');
        const multiplierStep = document.getElementById('multiplier-step');
        const movementStep = document.getElementById('movement-step');
        
        shapeStep.classList.add('hidden');
        shapeStep.style.display = 'none'; // 강제로 숨기기
        multiplierStep.classList.add('hidden');
        multiplierStep.style.display = 'none'; // 강제로 숨기기
        movementStep.classList.remove('hidden');
        movementStep.style.display = 'block'; // 강제로 보이기
        
        // Level 1용 특별한 제목 - x²에서 시작해서 목표 완전제곱식 만들기
        const { a, h, k } = currentEquation;
        let targetEquation = '';
        
        // 완전제곱식 형태로 목표 표시
        if (h === 0) {
            targetEquation = 'x²';
        } else if (h > 0) {
            targetEquation = `(x - ${h})²`;
        } else {
            targetEquation = `(x + ${Math.abs(h)})²`;
        }
        
        if (k > 0) {
            targetEquation += ` + ${k}`;
        } else if (k < 0) {
            targetEquation += ` - ${Math.abs(k)}`;
        }
        
        document.getElementById('movement-step-title').textContent = `🎯 x²을 평행이동시켜서 ${targetEquation}을 완성해보세요!`;
        
        // Level 1은 항상 x² (a=1)에서 시작
        const canvas = document.getElementById('graph-canvas');
        const ctx = canvas.getContext('2d');
        drawCoordinateSystem(ctx, canvas, 0, 0);
        drawParabola(ctx, canvas, 0, 0, 1);
        
        displayTargetEquation();
        updateGraphFeedback('x² 그래프를 평행이동시켜서 목표 위치로 이동시켜보세요!', 'info');
    } else {
        // Level 2: 개형 선택 단계부터 시작
        const shapeStep = document.getElementById('shape-selection-step');
        const multiplierStep = document.getElementById('multiplier-step');
        const movementStep = document.getElementById('movement-step');
        
        shapeStep.classList.remove('hidden');
        shapeStep.style.display = 'block'; // 강제로 보이기
        multiplierStep.classList.add('hidden');
        multiplierStep.style.display = 'none'; // 강제로 숨기기
        movementStep.classList.add('hidden');
        movementStep.style.display = 'none'; // 강제로 숨기기
        
        // 원래 이차식을 사용하여 설명과 표시
        const originalFormat = convertToStandardForm(currentEquation);
        document.getElementById('shape-description').textContent = 
            `🤔 ${originalFormat}과 같은 개형을 가진 그래프를 선택하세요:`;
        document.getElementById('original-equation-display').textContent = originalFormat;
        
        // multiplier-step도 미리 현재 이차식으로 설정
        setupMultiplierStep();
    }
}

// 개형 선택 설정

// 개형 선택
function selectShape(shape) {
    selectedShape = shape;
    
    // 모든 개형 버튼에서 선택 클래스 제거
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 선택된 버튼에 클래스 추가
    document.querySelector(`[data-shape="${shape}"]`).classList.add('selected');
    
    // 선택한 개형이 맞는지 즉시 확인
    // a > 0 (아래로 볼록, ∪) → 'down' 선택해야 정답
    // a < 0 (위로 볼록, ∩) → 'up' 선택해야 정답  
    const isCorrect = (currentEquation.a > 0 && shape === 'down') || (currentEquation.a < 0 && shape === 'up');
    
    if (isCorrect) {
        // 맞으면 배수 입력 단계로 (멘트 없이)
        setTimeout(() => {
            const shapeStep = document.getElementById('shape-selection-step');
            const multiplierStep = document.getElementById('multiplier-step');
            
            shapeStep.classList.add('hidden');
            shapeStep.style.display = 'none';
            multiplierStep.classList.remove('hidden');
            multiplierStep.style.display = 'block';
            
            // 입력 필드만 초기화 (setupMultiplierStep 다시 호출하지 않음)
            document.getElementById('multiplier-input').value = '';
        }, 300);
    } else {
        // 틀리면 에러 메시지
        setTimeout(() => {
            alert('틀렸습니다! 다시 생각해보세요.');
            selectedShape = null;
            document.querySelectorAll('.shape-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        }, 200);
    }
}

// 배수 입력 단계 설정
function setupMultiplierStep() {
    // 원래 문제의 이차식을 기준으로 배수 질문
    const { a, b, c } = currentEquation;
    const targetCoeff = Math.abs(a);
    // baseShape는 선택된 개형에 따라 결정
    const baseShape = a > 0 ? 'y = x²' : 'y = -x²';
    
    // 개형에 따라 질문 제목 변경
    const questionTitle = a > 0 ? 
        '🔢 x²을 몇 배 해야 같은 개형이 나오겠나요?' : 
        '🔢 -x²을 몇 배 해야 같은 개형이 나오겠나요?';
    document.getElementById('multiplier-question-title').textContent = questionTitle;
    
    // 원래 이차식 표시
    let originalEquation = '';
    if (a === 1) {
        originalEquation = 'x²';
    } else if (a === -1) {
        originalEquation = '-x²';
    } else {
        originalEquation = `${a}x²`;
    }
    
    if (b > 0) {
        originalEquation += ` + ${b}x`;
    } else if (b < 0) {
        originalEquation += ` - ${Math.abs(b)}x`;
    }
    
    if (c > 0) {
        originalEquation += ` + ${c}`;
    } else if (c < 0) {
        originalEquation += ` - ${Math.abs(c)}`;
    }
    
    const targetShape = `${originalEquation}`;
    
    console.log('배수 설정:', {
        'currentEquation': currentEquation,
        'targetCoeff': targetCoeff,
        'baseShape': baseShape,
        'targetShape': targetShape
    });
    
    document.getElementById('base-shape-display').textContent = baseShape;
    document.getElementById('target-shape-display').textContent = targetShape;
}

// 배수 확인
function checkMultiplier() {
    const input = document.getElementById('multiplier-input');
    const value = parseFloat(input.value.trim());
    
    if (isNaN(value) || value <= 0) {
        alert('양수를 입력해주세요!');
        return;
    }
    
    // x²에서 ax²로 만들기 위한 정답 계산
    const correctMultiplier = Math.abs(currentEquation.a);
    
    console.log('배수 확인:', {
        '입력값': value,
        '정답': correctMultiplier,
        'currentEquation.a': currentEquation.a
    });
    
    if (Math.abs(value - correctMultiplier) < 0.001) {
        // 맞으면 성공 메시지 표시 후 평행이동 단계로
        showSuccessMessage('🎉 맞습니다! 이제 그래프를 평행이동시켜보세요!');
        
        setTimeout(() => {
            const multiplierStep = document.getElementById('multiplier-step');
            const movementStep = document.getElementById('movement-step');
            
            multiplierStep.classList.add('hidden');
            multiplierStep.style.display = 'none';
            movementStep.classList.remove('hidden');
            movementStep.style.display = 'block';
            
            // Level 2도 Level 1처럼 완전제곱식 형태로 제목 표시
            const { a, h, k } = currentEquation;
            let targetEquation = '';
            
            // 완전제곱식 형태로 목표 표시 (Level 2는 계수 a 포함)
            if (a === 1) {
                targetEquation = '';
            } else if (a === -1) {
                targetEquation = '-';
            } else {
                targetEquation = `${a}`;
            }
            
            if (h === 0) {
                targetEquation += '(x)²';
            } else if (h > 0) {
                targetEquation += `(x - ${h})²`;
            } else {
                targetEquation += `(x + ${Math.abs(h)})²`;
            }
            
            if (k > 0) {
                targetEquation += ` + ${k}`;
            } else if (k < 0) {
                targetEquation += ` - ${Math.abs(k)}`;
            }
            
            const baseGraphText = a > 0 ? `${Math.abs(a)}x²` : `-${Math.abs(a)}x²`;
            document.getElementById('movement-step-title').textContent = `🎯 ${baseGraphText}을 평행이동시켜서 ${targetEquation}을 완성해보세요!`;
            
            initializeGraph();
            displayTargetEquation();
            updateGraphFeedback('이제 그래프를 목표 위치로 이동시켜보세요!', 'info');
        }, 1500); // 1.5초 후 다음 단계로
    } else {
        alert('다시 시도해보세요!');
        input.value = '';
    }
}

// 그래프 초기화 (통합된 함수)
function initializeGraph() {
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    
    // Level 1과 2 모두 현재 방정식의 계수 a 사용
    const a = currentEquation.a;
    drawCoordinateSystem(ctx, canvas, 0, 0);
    drawParabola(ctx, canvas, 0, 0, a);
}

// 좌표계 그리기 (동적 스케일링)
function drawCoordinateSystem(ctx, canvas, h = 0, k = 0) {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 꼭짓점이 보이도록 스케일 계산
    const maxAbsH = Math.abs(h);
    const maxAbsK = Math.abs(k);
    const maxRange = Math.max(maxAbsH + 2, maxAbsK + 2, 5); // 최소 5단위는 보이도록
    
    const scale = Math.min(40, (Math.min(width, height) / 2) / (maxRange + 1));
    
    ctx.clearRect(0, 0, width, height);
    
    // 격자 그리기
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    const gridRange = Math.ceil(maxRange + 2);
    for (let i = -gridRange; i <= gridRange; i++) {
        // 세로선
        ctx.beginPath();
        ctx.moveTo(centerX + i * scale, 0);
        ctx.lineTo(centerX + i * scale, height);
        ctx.stroke();
        
        // 가로선
        ctx.beginPath();
        ctx.moveTo(0, centerY + i * scale);
        ctx.lineTo(width, centerY + i * scale);
        ctx.stroke();
    }
    
    // 축 그리기
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // x축
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // y축
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // 축 레이블
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = -gridRange; i <= gridRange; i++) {
        if (i !== 0) {
            // x축 숫자
            const xPos = centerX + i * scale;
            if (xPos > 20 && xPos < width - 20) {
                ctx.fillText(i.toString(), xPos, centerY + 15);
            }
            // y축 숫자
            const yPos = centerY - i * scale;
            if (yPos > 15 && yPos < height - 15) {
                ctx.textAlign = 'right';
                ctx.fillText(i.toString(), centerX - 8, yPos + 4);
                ctx.textAlign = 'center';
            }
        }
    }
    
    return scale; // 스케일 값을 반환
}

// 포물선 그리기 (꼭짓점 표시 포함)
function drawParabola(ctx, canvas, h, k, a = 1) {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 스케일 계산
    const maxAbsH = Math.abs(h);
    const maxAbsK = Math.abs(k);
    const maxRange = Math.max(maxAbsH + 2, maxAbsK + 2, 5);
    const scale = Math.min(40, (Math.min(width, height) / 2) / (maxRange + 1));
    
    // 포물선 그리기
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let firstPoint = true;
    const range = maxRange + 2;
    for (let x = -range; x <= range; x += 0.1) {
        const y = a * (x - h) * (x - h) + k;
        
        const canvasX = centerX + x * scale;
        const canvasY = centerY - y * scale;
        
        if (canvasX >= 0 && canvasX <= width && canvasY >= 0 && canvasY <= height) {
            if (firstPoint) {
                ctx.moveTo(canvasX, canvasY);
                firstPoint = false;
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
        }
    }
    
    ctx.stroke();
    
    // 꼭짓점 표시
    const vertexX = centerX + h * scale;
    const vertexY = centerY - k * scale;
    
    // 꼭짓점 점 그리기
    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.arc(vertexX, vertexY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // 꼭짓점 좌표 텍스트
    ctx.fillStyle = '#dc3545';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    let coordText = `(${h}, ${k})`;
    // 분수로 표시할지 결정
    if (h % 1 !== 0) {
        const hFraction = decimalToFraction(h);
        coordText = coordText.replace(h.toString(), hFraction);
    }
    if (k % 1 !== 0) {
        const kFraction = decimalToFraction(k);
        coordText = coordText.replace(k.toString(), kFraction);
    }
    
    // 텍스트 위치 조정 (그래프 위쪽에 표시)
    const textY = vertexY - 15;
    ctx.fillText(coordText, vertexX, textY);
    
    // 텍스트 배경 (가독성을 위해)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const textWidth = ctx.measureText(coordText).width;
    ctx.fillRect(vertexX - textWidth/2 - 3, textY - 12, textWidth + 6, 16);
    
    // 다시 텍스트 그리기
    ctx.fillStyle = '#dc3545';
    ctx.fillText(coordText, vertexX, textY);
}

// 소수를 분수로 변환하는 함수
function decimalToFraction(decimal) {
    const tolerance = 1e-6;
    let numerator = 1;
    let denominator = 1;
    
    // 간단한 분수들 확인
    const commonFractions = [
        {decimal: 0.5, fraction: '1/2'},
        {decimal: 1.5, fraction: '3/2'},
        {decimal: 2.5, fraction: '5/2'},
        {decimal: 3.5, fraction: '7/2'},
        {decimal: 4.5, fraction: '9/2'},
        {decimal: -0.5, fraction: '-1/2'},
        {decimal: -1.5, fraction: '-3/2'},
        {decimal: -2.5, fraction: '-5/2'},
        {decimal: -3.5, fraction: '-7/2'},
        {decimal: -4.5, fraction: '-9/2'},
        {decimal: 0.25, fraction: '1/4'},
        {decimal: 0.75, fraction: '3/4'},
        {decimal: 1.25, fraction: '5/4'},
        {decimal: 1.75, fraction: '7/4'},
        {decimal: -0.25, fraction: '-1/4'},
        {decimal: -0.75, fraction: '-3/4'},
        {decimal: -1.25, fraction: '-5/4'},
        {decimal: -1.75, fraction: '-7/4'}
    ];
    
    for (let frac of commonFractions) {
        if (Math.abs(decimal - frac.decimal) < tolerance) {
            return frac.fraction;
        }
    }
    
    return decimal.toString();
}

// 방향 선택
function selectDirection(direction) {
    selectedDirection = direction;
    
    // 모든 방향 버튼에서 선택 클래스 제거
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 선택된 버튼에 클래스 추가
    document.querySelector(`[data-direction="${direction}"]`).classList.add('selected');
    
    // 이동량이 입력되어 있으면 바로 이동
    const amount = document.getElementById('move-amount').value.trim();
    if (amount) {
        moveGraph();
    }
}

// 그래프 이동
function moveGraph() {
    const amountStr = document.getElementById('move-amount').value.trim();
    if (!amountStr || !selectedDirection) return;
    
    let amount;
    if (amountStr.includes('/')) {
        const [num, den] = amountStr.split('/');
        amount = parseFloat(num) / parseFloat(den);
    } else {
        amount = parseFloat(amountStr);
    }
    
    if (isNaN(amount)) {
        alert('올바른 숫자를 입력해주세요!');
        return;
    }
    
    // 방향에 따라 이동
    switch (selectedDirection) {
        case 'up':
            graphTransformations.k += amount;
            break;
        case 'down':
            graphTransformations.k -= amount;
            break;
        case 'left':
            graphTransformations.h -= amount;
            break;
        case 'right':
            graphTransformations.h += amount;
            break;
    }
    
    // 그래프 다시 그리기
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    // Level 1은 항상 x² (a=1), Level 2는 현재 방정식의 계수 a 사용
    const a = currentLevel === 1 ? 1 : currentEquation.a;
    drawCoordinateSystem(ctx, canvas, graphTransformations.h, graphTransformations.k);
    drawParabola(ctx, canvas, graphTransformations.h, graphTransformations.k, a);
    
    // 입력 필드 초기화
    document.getElementById('move-amount').value = '';
    selectedDirection = null;
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// 그래프 초기화
function resetGraph() {
    graphTransformations = { h: 0, k: 0 };
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    // Level 1은 항상 x² (a=1)에서 시작, Level 2는 현재 방정식의 계수 a 사용
    const a = currentLevel === 1 ? 1 : currentEquation.a;
    drawCoordinateSystem(ctx, canvas, 0, 0);
    drawParabola(ctx, canvas, 0, 0, a);
}

// 목표 방정식 표시 (항상 원래 완전제곱식 사용)
function displayTargetEquation() {
    const { a, h, k } = currentEquation;
    let equationText = '';
    
    // Level 1과 2 모두 a(x - h)² + k 형태로 표시
    if (a === 1) {
        equationText = '';
    } else if (a === -1) {
        equationText = '-';
    } else {
        equationText = `${a}`;
    }
    
    // (x - h) 부분 처리 - 분수도 올바르게 처리
    if (h === 0) {
        equationText += '(x)²';
    } else if (h > 0) {
        // h가 분수인 경우 처리
        if (h % 1 !== 0) {
            const hFraction = decimalToFraction(h);
            equationText += `(x - ${hFraction})²`;
        } else {
            equationText += `(x - ${h})²`;
        }
    } else {
        // h가 음수인 경우 (x + |h|) 형태로
        const absH = Math.abs(h);
        if (absH % 1 !== 0) {
            const hFraction = decimalToFraction(absH);
            equationText += `(x + ${hFraction})²`;
        } else {
            equationText += `(x + ${absH})²`;
        }
    }
    
    // +k 부분 처리 - 분수도 올바르게 처리
    if (k > 0) {
        if (k % 1 !== 0) {
            const kFraction = decimalToFraction(k);
            equationText += ` + ${kFraction}`;
        } else {
            equationText += ` + ${k}`;
        }
    } else if (k < 0) {
        const absK = Math.abs(k);
        if (absK % 1 !== 0) {
            const kFraction = decimalToFraction(absK);
            equationText += ` - ${kFraction}`;
        } else {
            equationText += ` - ${absK}`;
        }
    }
    
    // y = 추가
    equationText = 'y = ' + equationText;
    
    document.getElementById('target-equation-display').textContent = equationText;
}

// 그래프 이동 완료 확인
function checkGraphMovement() {
    const tolerance = 0.1;
    const hCorrect = Math.abs(graphTransformations.h - currentEquation.h) < tolerance;
    const kCorrect = Math.abs(graphTransformations.k - currentEquation.k) < tolerance;
    
    graphAttempts++;
    
    if (hCorrect && kCorrect) {
        // 완전히 성공
        if (isRetryPhase) {
            // 재시도에서 성공
            updateGraphFeedback('🎉 훌륭합니다! 재시도에서 완벽하게 성공하셨네요!', 'success');
            setTimeout(() => {
                updateSuccessScreen();
                showScreen('success');
            }, 2000);
        } else {
            // 첫 시도에서 성공
            updateGraphFeedback('🎉 완벽합니다! 한 번에 성공하셨네요!', 'success');
            setTimeout(() => {
                updateSuccessScreen();
                showScreen('success');
            }, 2000);
        }
    } else {
        // 틀렸을 때 - 구체적인 피드백 제공
        let feedback = '';
        
        if (hCorrect && !kCorrect) {
            feedback = '👍 x축 방향으로의 이동은 맞았습니다! 하지만 y축 방향으로의 이동은 틀렸습니다.';
        } else if (!hCorrect && kCorrect) {
            feedback = '👍 y축 방향으로의 이동은 맞았습니다! 하지만 x축 방향으로의 이동은 틀렸습니다.';
        } else {
            feedback = '❌ x축과 y축 방향 모두 다시 확인해보세요.';
        }
        
        if (graphAttempts === 1) {
            // 첫 번째 실패
            updateGraphFeedback(feedback + ' 다시 시도해보세요!', 'warning');
        } else if (graphAttempts >= 2 && !isRetryPhase) {
            // 두 번째 이후 실패 - 재시도 단계로 진입
            updateGraphFeedback(feedback + ' 그러면 다시 한 번 시도해봅시다!', 'info');
            setTimeout(() => {
                startRetryPhase();
            }, 2000);
        } else if (isRetryPhase) {
            // 재시도 단계에서 실패
            updateGraphFeedback(feedback + ' 다시 한 번 더 시도해보세요!', 'warning');
        }
    }
}

// 재시도 단계 시작
function startRetryPhase() {
    isRetryPhase = true;
    graphTransformations = { h: 0, k: 0 };
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    // Level 1은 항상 x² (a=1)에서 시작, Level 2는 현재 방정식의 계수 a 사용
    const a = currentLevel === 1 ? 1 : currentEquation.a;
    drawCoordinateSystem(ctx, canvas, 0, 0);
    drawParabola(ctx, canvas, 0, 0, a);
    updateGraphFeedback('🔄 새로운 도전! x² 그래프를 다시 목표 위치로 이동시켜보세요!', 'info');
}

// 그래프 피드백 업데이트
function updateGraphFeedback(message, type) {
    let feedbackElement = document.getElementById('graph-feedback');
    if (!feedbackElement) {
        // 피드백 요소가 없으면 생성
        feedbackElement = document.createElement('div');
        feedbackElement.id = 'graph-feedback';
        feedbackElement.className = 'feedback';
        
        // 그래프 컨테이너 다음에 추가
        const graphContainer = document.querySelector('.graph-container');
        graphContainer.parentNode.insertBefore(feedbackElement, graphContainer.nextSibling);
    }
    
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    feedbackElement.classList.remove('hidden');
}

// 화면 전환
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// 메인으로 돌아가기 (중복 제거 - 더 완전한 버전 사용)
function resetToMain() {
    showScreen('main');
    // 모든 상태 초기화
    wrongAttempts = 0;
    graphTransformations = { h: 0, k: 0 };
    graphAttempts = 0;
    isRetryPhase = false;
    selectedShape = null;
    clearUserInput();
    hideFeedback();
    
    // 그래프 피드백도 숨기기
    const graphFeedback = document.getElementById('graph-feedback');
    if (graphFeedback) {
        graphFeedback.classList.add('hidden');
    }
    
    // 모든 입력 필드 초기화
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    
    // 모든 선택 상태 제거
    document.querySelectorAll('.selected').forEach(el => {
        el.classList.remove('selected');
    });
}