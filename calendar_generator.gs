/**
 * 씨앗교회 월간계획 달력 자동 생성 스크립트
 * 실제 시트 구조를 반영한 업데이트 버전
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('달력 자동화')
    .addItem('월별 달력 생성', 'createMonthlyCalendar')
    .addToUi();
}

function createMonthlyCalendar() {
  const ui = SpreadsheetApp.getUi();
  
  // 사용자로부터 월 입력 받기
  const response = ui.prompt(
    '월별 달력 생성',
    '생성할 월을 입력하세요 (예: 6, 7, 8-12):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() == ui.ButtonSet.CANCEL) {
    return;
  }
  
  const monthInput = response.getResponseText().trim();
  if (!monthInput) {
    ui.alert('올바른 월을 입력해주세요 (예: 6, 7, 8-12)');
    return;
  }
  
  let months = [];
  if (monthInput.includes('-')) {
    // 범위 입력 (예: 8-12)
    const [start, end] = monthInput.split('-').map(s => parseInt(s.trim()));
    if (isNaN(start) || isNaN(end) || start < 1 || end > 12 || start > end) {
      ui.alert('올바른 월 범위를 입력해주세요 (예: 8-12, 1-3)');
      return;
    }
    for (let m = start; m <= end; m++) {
      months.push(m);
    }
  } else {
    // 단일 월 입력
    const m = parseInt(monthInput);
    if (isNaN(m) || m < 1 || m > 12) {
      ui.alert('월은 1-12 사이의 숫자여야 합니다.');
      return;
    }
    months = [m];
  }
  
  const year = new Date().getFullYear();
  let successCount = 0;
  let failCount = 0;
  let failMonths = [];
  
  for (const month of months) {
    try {
      generateCalendar(year, month);
      successCount++;
    } catch (error) {
      failCount++;
      failMonths.push(month);
    }
  }
  
  if (successCount > 0) {
    ui.alert(`${successCount}개 달력이 성공적으로 생성되었습니다!`);
  }
  if (failCount > 0) {
    ui.alert(`다음 월은 생성에 실패했습니다: ${failMonths.join(', ')}`);
  }
}

function generateCalendar(year, month) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 반드시 '달력템플릿' 시트가 있어야 함
  const templateSheet = ss.getSheetByName('달력템플릿');
  if (!templateSheet) {
    SpreadsheetApp.getUi().alert('"달력템플릿" 시트가 없습니다. 먼저 템플릿 시트를 만들어 주세요.');
    throw new Error('달력템플릿 시트 없음');
  }
  
  // 새 시트 이름 생성
  const monthName = month + '월';
  const sheetName = `${monthName} 계획`;
  
  // 기존 시트가 있으면 삭제
  const existingSheet = ss.getSheetByName(sheetName);
  if (existingSheet) {
    ss.deleteSheet(existingSheet);
  }
  
  // 템플릿 복제
  const newSheet = templateSheet.copyTo(ss);
  newSheet.setName(sheetName);
  
  // 월별 데이터 생성
  const monthData = generateMonthData(year, month);
  
  // 시트에 데이터 적용
  applyMonthData(newSheet, monthData, month);
  
  // 시트를 맨 앞으로 이동
  ss.setActiveSheet(newSheet);
}

function createTemplateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const templateSheet = ss.insertSheet('달력템플릿');
  
  // 기본 구조 설정
  const structure = [
    ['', '', '', '', '', '', '', ''],
    ['월 계획[일정, 근무, 차량]', '박일섭(박)이은철(철)김선민(김)서동진(서)', '공선희(공)박기태(태)이우석(석)신현덕(신)', '김완종(완)서정화(화)백요한(백)방사무엘(방)', '이진우박부환씨앗학교교회학교', '', '', ''],
    ['요일', '주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    ['날짜', '', '', '', '', '', '', ''],
    ['일정', '', '', '', '', '', '', ''],
    ['매일씨앗묵상', '', '', '', '', '', '', ''],
    ['커피관리', '', '', '', '', '', '', ''],
    ['근무', '', '', '', '', '', '', ''],
    ['차량/기타', '', '', '', '', '', '', '']
  ];
  
  // 구조 데이터 입력
  templateSheet.getRange(1, 1, structure.length, 8).setValues(structure);
  
  // 스타일 적용
  applyTemplateStyles(templateSheet);
  
  return templateSheet;
}

function applyTemplateStyles(sheet) {
  // 제목 행 스타일 (2행)
  const titleRange = sheet.getRange(2, 1, 1, 8);
  titleRange.setFontWeight('bold');
  titleRange.setFontSize(12);
  titleRange.setBackground('#E8F0FE');
  
  // 요일 행 스타일 (3행)
  const dayHeaderRange = sheet.getRange(3, 1, 1, 8);
  dayHeaderRange.setFontWeight('bold');
  dayHeaderRange.setBackground('#F3F3F3');
  dayHeaderRange.setHorizontalAlignment('center');
  
  // 라벨 열 스타일 (A열)
  const labelRange = sheet.getRange(4, 1, 6, 1);
  labelRange.setFontWeight('bold');
  labelRange.setBackground('#F8F9FA');
  labelRange.setHorizontalAlignment('center');
  
  // 날짜 셀 스타일
  const dateRange = sheet.getRange(4, 2, 1, 7);
  dateRange.setFontWeight('bold');
  dateRange.setHorizontalAlignment('center');
  dateRange.setBackground('#FFFFFF');
  
  // 테두리 설정
  const allRange = sheet.getRange(1, 1, 9, 8);
  allRange.setBorder(true, true, true, true, true, true);
  
  // 열 너비 조정
  sheet.setColumnWidth(1, 120); // 라벨 열
  for (let i = 2; i <= 8; i++) {
    sheet.setColumnWidth(i, 150); // 날짜 열들
  }
  
  // 행 높이 조정
  sheet.setRowHeight(2, 30); // 제목 행
  sheet.setRowHeight(3, 25); // 요일 행
  sheet.setRowHeight(4, 25); // 날짜 행
  for (let i = 5; i <= 9; i++) {
    sheet.setRowHeight(i, 60); // 라벨 행들
  }
}

function generateMonthData(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0=일요일, 1=월요일, ...
  
  const weeks = [];
  let currentWeek = [];
  
  // 첫 주의 빈 셀들
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push('');
  }
  
  // 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day + '일');
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // 마지막 주 처리: 남은 칸은 빈 문자열로 채움
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push('');
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

function applyMonthData(sheet, monthData, month) {
  // 제목 업데이트
  const titleCell = sheet.getRange(2, 1);
  titleCell.setValue(`${month}월 계획[일정, 근무, 차량]`);

  let currentRow = 4;
  for (let weekIndex = 0; weekIndex < monthData.length; weekIndex++) {
    const week = monthData[weekIndex];
    Logger.log(`applyMonthData: weekIndex=${weekIndex}, currentRow=${currentRow}, week=${JSON.stringify(week)}`);
    // 날짜 행
    const dateRange = sheet.getRange(currentRow, 2, 1, 7);
    dateRange.setValues([week]);
    // 날짜 셀 스타일 반복 적용
    for (let col = 0; col < 7; col++) {
      const cell = sheet.getRange(currentRow, col + 2);
      cell.setFontWeight('bold');
      cell.setHorizontalAlignment('center');
      cell.setBorder(true, true, true, true, true, true);
      cell.setFontSize(12);
      cell.setBackground('#E0E0E0');
      if (week[col] !== '') {
        // 일요일만 빨간색, 토요일/평일은 검정
        if (col === 0) {
          cell.setFontColor('#FF0000'); // 일요일 빨간색
        } else {
          cell.setFontColor('#000000'); // 평일/토요일 검정
        }
      } else {
        cell.setFontColor('#000000');
      }
    }
    // 라벨 행들에도 반복적으로 스타일 적용
    for (let labelRow = 1; labelRow <= 5; labelRow++) {
      for (let col = 0; col < 7; col++) {
        const cell = sheet.getRange(currentRow + labelRow, col + 2);
        cell.setBorder(true, true, true, true, true, true);
        cell.setFontSize(11);
        cell.setFontWeight('normal');
        cell.setHorizontalAlignment('center');
        cell.setBackground('#FFFFFF');
      }
    }
    currentRow += 6;
  }
  // monthData.length < 6이면, 남은 6주차(날짜+라벨 6행) 삭제
  if (monthData.length < 6) {
    const startRow = 4 + monthData.length * 6;
    SpreadsheetApp.getUi().alert(`Deleting rows: ${startRow}~${startRow+5} (monthData.length=${monthData.length})`);
    sheet.deleteRows(startRow, 6);
  }
  // 공휴일 자동 표시 (선택사항)
  markHolidays(sheet, monthData, month);
}

function markHolidays(sheet, monthData, month) {
  const year = new Date().getFullYear();
  // 한국 공휴일 목록 (2025년 기준)
  const holidays = {
    1: [1], // 신정
    3: [1], // 삼일절
    5: [5], // 어린이날
    6: [6], // 현충일
    8: [15], // 광복절
    10: [3, 9], // 개천절, 한글날
    12: [25] // 크리스마스
  };
  // 음력 공휴일 (근사치)
  const lunarHolidays = {
    1: [1, 2], // 설날
    4: [8], // 부처님 오신 날
    8: [15], // 추석
    9: [16, 17] // 추석 연휴
  };
  const monthHolidays = holidays[month] || [];
  const monthLunarHolidays = lunarHolidays[month] || [];
  let currentRow = 4;
  for (let weekIndex = 0; weekIndex < monthData.length; weekIndex++) {
    const week = monthData[weekIndex];
    for (let col = 0; col < 7; col++) {
      if (week[col] !== '') {
        const day = parseInt(week[col]);
        if (monthHolidays.includes(day) || monthLunarHolidays.includes(day)) {
          const cell = sheet.getRange(currentRow, col + 2);
          cell.setFontColor('#FF0000'); // 공휴일 날짜만 빨간색
        }
      }
    }
    currentRow += 6;
  }
}

// 테스트 함수
function testCalendarGeneration() {
  generateCalendar(2025, 8);
} 