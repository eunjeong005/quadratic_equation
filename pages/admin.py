import streamlit as st
import json
import pandas as pd
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="이차함수 학습 관리자",
    page_icon="📊",
    layout="wide"
)

st.title("📊 이차함수 학습 프로그램 관리자 페이지")
st.markdown("---")

# 사이드바 메뉴
page = st.sidebar.selectbox(
    "페이지 선택",
    ["📈 학습 통계", "📝 문제 관리", "👥 학생 관리", "⚙️ 설정"]
)

if page == "📈 학습 통계":
    st.header("📈 학습 통계 대시보드")
    
    # 더미 데이터 생성 (실제로는 데이터베이스에서 가져옴)
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 사용자", "127", "12")
    with col2:
        st.metric("오늘 접속", "23", "3")
    with col3:
        st.metric("평균 정답률", "78%", "5%")
    with col4:
        st.metric("완료율", "65%", "-2%")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("일일 접속자 수")
        # 더미 차트 데이터
        dates = pd.date_range('2025-10-01', '2025-10-13', freq='D')
        users = [15, 18, 22, 19, 25, 30, 28, 35, 32, 38, 41, 35, 23]
        
        fig = px.line(x=dates, y=users, title="일일 접속자 추이")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("레벨별 완료율")
        levels = ['Level 1', 'Level 2']
        completion = [85, 62]
        
        fig = px.bar(x=levels, y=completion, title="레벨별 완료율")
        st.plotly_chart(fig, use_container_width=True)
    
    st.subheader("학습 패턴 분석")
    
    # 시간대별 접속 패턴
    hours = list(range(24))
    activity = [2, 1, 1, 0, 0, 1, 3, 8, 15, 12, 10, 8, 6, 9, 12, 18, 22, 25, 20, 15, 12, 8, 5, 3]
    
    fig = go.Figure(data=go.Scatter(x=hours, y=activity, mode='lines+markers'))
    fig.update_layout(title="시간대별 접속 패턴", xaxis_title="시간", yaxis_title="접속자 수")
    st.plotly_chart(fig, use_container_width=True)

elif page == "📝 문제 관리":
    st.header("📝 문제 관리")
    
    tab1, tab2, tab3 = st.tabs(["문제 생성", "문제 목록", "난이도 조정"])
    
    with tab1:
        st.subheader("새 문제 생성")
        
        col1, col2 = st.columns(2)
        with col1:
            level = st.selectbox("레벨", ["Level 1", "Level 2"])
            a_coeff = st.number_input("a 계수", value=1 if level == "Level 1" else 2)
            b_coeff = st.number_input("b 계수", value=4)
            c_coeff = st.number_input("c 계수", value=3)
        
        with col2:
            difficulty = st.selectbox("난이도", ["쉬움", "보통", "어려움"])
            category = st.selectbox("카테고리", ["완전제곱식", "그래프변환", "혼합"])
            tags = st.text_input("태그 (쉼표로 구분)")
        
        if st.button("문제 추가"):
            st.success(f"새 문제가 추가되었습니다: {a_coeff}x² + {b_coeff}x + {c_coeff}")
    
    with tab2:
        st.subheader("문제 목록")
        
        # 더미 문제 데이터
        problems_data = {
            "ID": [1, 2, 3, 4, 5],
            "방정식": ["x² + 4x + 3", "2x² - 6x + 1", "-x² + 8x - 5", "3x² + 12x + 9", "x² - 2x - 3"],
            "레벨": ["Level 1", "Level 2", "Level 2", "Level 2", "Level 1"],
            "난이도": ["보통", "어려움", "쉬움", "보통", "쉬움"],
            "정답률": ["85%", "62%", "91%", "73%", "88%"]
        }
        
        df = pd.DataFrame(problems_data)
        st.dataframe(df, use_container_width=True)
    
    with tab3:
        st.subheader("난이도 조정")
        
        st.write("계수 범위 설정:")
        
        col1, col2 = st.columns(2)
        with col1:
            st.write("**Level 1**")
            l1_b_min = st.number_input("b 최솟값", value=-10, key="l1_b_min")
            l1_b_max = st.number_input("b 최댓값", value=10, key="l1_b_max")
            l1_c_min = st.number_input("c 최솟값", value=-15, key="l1_c_min")
            l1_c_max = st.number_input("c 최댓값", value=15, key="l1_c_max")
        
        with col2:
            st.write("**Level 2**")
            l2_a_range = st.multiselect("a 계수 범위", [-4, -3, -2, 2, 3, 4, 5], default=[2, 3, -2])
            l2_b_multiplier = st.slider("b 계수 배수", 1, 6, 3)
            l2_c_min = st.number_input("c 최솟값", value=-15, key="l2_c_min")
            l2_c_max = st.number_input("c 최댓값", value=15, key="l2_c_max")
        
        if st.button("설정 저장"):
            st.success("난이도 설정이 저장되었습니다!")

elif page == "👥 학생 관리":
    st.header("👥 학생 관리")
    
    tab1, tab2 = st.tabs(["학생 목록", "개별 진도"])
    
    with tab1:
        st.subheader("등록된 학생 목록")
        
        # 더미 학생 데이터
        students_data = {
            "ID": ["S001", "S002", "S003", "S004", "S005"],
            "이름": ["김수학", "이함수", "박그래프", "최이차", "정방정식"],
            "Level 1 진도": ["100%", "85%", "92%", "78%", "100%"],
            "Level 2 진도": ["75%", "45%", "68%", "23%", "89%"],
            "총 학습시간": ["2시간 30분", "1시간 45분", "3시간 10분", "1시간 20분", "4시간 5분"],
            "마지막 접속": ["2025-10-13", "2025-10-12", "2025-10-13", "2025-10-11", "2025-10-13"]
        }
        
        df = pd.DataFrame(students_data)
        st.dataframe(df, use_container_width=True)
        
        # 학생 추가
        st.subheader("새 학생 등록")
        col1, col2, col3 = st.columns(3)
        with col1:
            new_id = st.text_input("학생 ID")
        with col2:
            new_name = st.text_input("이름")
        with col3:
            new_class = st.text_input("학급")
        
        if st.button("학생 추가"):
            if new_id and new_name:
                st.success(f"학생 {new_name}({new_id})이 추가되었습니다!")
    
    with tab2:
        st.subheader("개별 학생 진도")
        
        selected_student = st.selectbox("학생 선택", ["김수학", "이함수", "박그래프", "최이차", "정방정식"])
        
        col1, col2 = st.columns(2)
        
        with col1:
            # 진도 원형 차트
            progress_data = {"Level 1": 100, "Level 2": 75}
            fig = px.pie(values=list(progress_data.values()), names=list(progress_data.keys()), 
                        title=f"{selected_student}의 레벨별 진도")
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # 일별 학습 시간
            dates = ["10-09", "10-10", "10-11", "10-12", "10-13"]
            study_time = [45, 30, 60, 35, 50]
            
            fig = px.bar(x=dates, y=study_time, title="일별 학습 시간 (분)")
            st.plotly_chart(fig, use_container_width=True)

elif page == "⚙️ 설정":
    st.header("⚙️ 시스템 설정")
    
    tab1, tab2, tab3 = st.tabs(["일반 설정", "알림 설정", "백업 관리"])
    
    with tab1:
        st.subheader("일반 설정")
        
        col1, col2 = st.columns(2)
        with col1:
            max_attempts = st.number_input("최대 시도 횟수", value=5, min_value=1, max_value=10)
            show_hints = st.checkbox("힌트 표시", value=True)
            auto_save = st.checkbox("자동 저장", value=True)
        
        with col2:
            session_timeout = st.number_input("세션 타임아웃 (분)", value=30, min_value=5, max_value=120)
            enable_sound = st.checkbox("효과음 사용", value=False)
            dark_mode = st.checkbox("다크 모드", value=False)
        
        if st.button("설정 저장"):
            st.success("설정이 저장되었습니다!")
    
    with tab2:
        st.subheader("알림 설정")
        
        email_notifications = st.checkbox("이메일 알림 사용")
        if email_notifications:
            admin_email = st.text_input("관리자 이메일")
            daily_report = st.checkbox("일일 리포트 발송")
            error_alerts = st.checkbox("오류 알림")
        
        push_notifications = st.checkbox("푸시 알림 사용")
        if push_notifications:
            student_login = st.checkbox("학생 로그인 알림")
            completion_alerts = st.checkbox("완료 알림")
    
    with tab3:
        st.subheader("백업 관리")
        
        col1, col2 = st.columns(2)
        with col1:
            st.write("**자동 백업**")
            auto_backup = st.checkbox("자동 백업 사용", value=True)
            backup_interval = st.selectbox("백업 주기", ["매일", "매주", "매월"])
            
        with col2:
            st.write("**수동 백업**")
            if st.button("지금 백업 실행"):
                st.success("백업이 완료되었습니다!")
            
            if st.button("백업 파일 다운로드"):
                st.info("백업 파일을 다운로드합니다...")

# 푸터
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666; padding: 20px;'>
    <p>🎓 이차함수 학습 프로그램 관리자 v1.0</p>
    <p>학습 데이터와 시스템을 효율적으로 관리하세요!</p>
</div>
""", unsafe_allow_html=True)