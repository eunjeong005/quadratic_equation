import streamlit as st
import streamlit.components.v1 as components
import os
import re

# 페이지 설정 - 컴팩트한 레이아웃
st.set_page_config(
    page_title="이차함수 완전제곱식 & 그래프 변환 학습",
    page_icon="🎯",
    layout="wide",  # 변경: centered -> wide
    initial_sidebar_state="collapsed"
)

# 강제 업데이트 트리거 (v1.1)
st.markdown("<!-- Force Update v1.1 -->", unsafe_allow_html=True)

# 사이드바에 정보 추가
st.sidebar.title("📚 이차함수 학습 도우미")
st.sidebar.markdown("""
### 🎯 학습 목표
- 완전제곱식 변환 연습
- 그래프 평행이동 이해
- 이차함수와 그래프의 관계 파악

### 📖 사용법
1. **Level 1**: x² + bx + c 형태
2. **Level 2**: ax² + bx + c 형태

### 🔧 기능
- 랜덤 문제 생성
- 단계별 피드백
- 인터랙티브 그래프
""")

# 컴팩트한 메인 타이틀
st.title("🎯 이차함수 완전제곱식 & 그래프 변환 학습")

# 페이지 폭을 넓히고 여백을 줄이는 전역 CSS
st.markdown("""
<style>
/* 전체 최대 너비를 거의 화면 전체로 확장 */
.block-container {
    padding-top: 0.25rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25rem;
    max-width: 2200px; /* 화면을 최대한 활용 */
}

/* 기본 폰트/줄간격을 작게 해서 한 화면에 더 많은 텍스트가 보이게 함 */
html, body, .stApp, .block-container {
    font-size: 13px !important;
    line-height: 1.1 !important;
}

/* Streamlit 컴포넌트의 여백 최소화 */
.element-container, .stMarkdown, .stButton, .stTextInput, .stSelectbox {
    margin: 0 !important;
    padding: 0.15rem !important;
}

/* 헤더/사이드바 여백 축소 */
header[data-testid="stHeader"], aside[aria-label="Sidebar"] {
    padding: 6px 12px !important;
}

/* 버튼/입력 컨트롤을 작게 보이게 함 */
.stButton>button, .stTextInput>div, .stSelectbox>div {
    font-size: 12px !important;
    padding: 4px 6px !important;
}

/* 플롯/이미지 등 미디어 축소 */
img, svg, canvas {
    max-width: 100% !important;
    height: auto !important;
    transform-origin: 0 0;
    transform: scale(0.86); /* 필요시 더 작게: 0.8 등 */
}

/* 내부 html 임베드 요소 스케일(임베드된 페이지의 글자/그림 축소) */
iframe, .streamlit-expander {
    transform-origin: 0 0;
}

/* 줄 간격과 패딩을 더 줄이는 추가 선택자 */
h1, h2, h3, p, li, label {
    margin: 0;
    padding: 0;
}

/* 모바일/작은 화면 보정: 너무 작아지면 최소 폰트로 제한 */
@media (max-width: 900px) {
    html, body, .stApp, .block-container { font-size: 12px !important; }
}
</style>
""", unsafe_allow_html=True)

# HTML, CSS, JavaScript 파일 읽기
try:
    # HTML 파일 읽기
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # CSS 파일 읽기
    with open('src/style.css', 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # JavaScript 파일 읽기
    with open('src/script.js', 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # 최종적으로 CSS/JS를 인라인으로 삽입
    html_with_inline = html_content.replace(
        '<link rel="stylesheet" href="src/style.css">',
        f'<style>{css_content}</style>'
    ).replace(
        '<script src="src/script.js"></script>',
        f'<script>{js_content}</script>'
    )

    # iframe 내부에서 스크롤을 없애고 전체 내용을 보여주기 위한 추가 스타일
    # (body overflow visible, 스크롤바 숨김, 필요하면 내부 요소의 스케일도 조정)
    injection_style = """
    <style>
      html, body { overflow: visible !important; height: auto !important; }
      /* 내부 스크롤바 숨기기 (웹킷 브라우저용) */
      ::-webkit-scrollbar { display: none; }
      body { -ms-overflow-style: none; scrollbar-width: none; }
      /* 내부 컨텐츠가 너무 크면 글자/이미지 약간 축소 */
      body { transform-origin: 0 0; transform: scale(0.95); }
    </style>
    """
    # 위 스타일을 <head> 직후나 <body> 최상단에 삽입
    if '<head>' in html_with_inline:
        html_with_inline = html_with_inline.replace('<head>', '<head>' + injection_style)
    else:
        html_with_inline = injection_style + html_with_inline

    # 부모 페이지(스트림릿)에서 iframe을 충분히 크게 보이게 하는 전역 CSS
    st.markdown("""
    <style>
    /* Streamlit이 생성한 iframe(내부 srcdoc)에 대해 최소 높이/너비 확보 */
    iframe[srcdoc] {
        min-height: 1800px !important;  /* 필요에 따라 늘리세요 */
        height: auto !important;
        width: 100% !important;
        border: none !important;
        overflow: visible !important;
    }
    /* 부모 페이지가 내부 컨텐츠 전체를 수직으로 스크롤하도록 함 */
    .main > div[role="main"] { overflow: visible !important; }
    </style>
    """, unsafe_allow_html=True)

    # Streamlit에서 HTML 컴포넌트 실행 - 높이를 크게 잡고 내부 스크롤을 끔
    components.html(
        html_with_inline,
        height=2000,    # 더 크게 설정: 내부 내용이 많다면 2500~4000 등으로 조정
        width=1800,
        scrolling=False  # 내부 iframe 스크롤 끄기 -> 부모 페이지 스크롤 사용
    )
    
except FileNotFoundError as e:
    st.error(f"파일을 찾을 수 없습니다: {e}")
    st.info("현재 디렉토리의 파일들을 확인해주세요.")
    
    # 디버깅을 위한 파일 목록 표시
    if st.checkbox("파일 목록 보기"):
        current_files = []
        for root, dirs, files in os.walk('.'):
            for file in files:
                current_files.append(os.path.join(root, file))
        
        st.write("현재 디렉토리의 파일들:")
        for file in sorted(current_files):
            st.write(f"- {file}")

# 컴팩트한 푸터
st.markdown("""
<div style='text-align: center; color: #666; padding: 10px;'>
    <p>🎓 이차함수 학습 프로그램 v1.0</p>
</div>
""", unsafe_allow_html=True)