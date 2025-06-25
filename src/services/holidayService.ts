// 한국 공휴일 계산 서비스
export interface Holiday {
  date: string; // YYYY-MM-DD 형식
  name: string;
  type: 'national' | 'substitute' | 'temporary';
}

// 음력 공휴일 (매년 고정)
const LUNAR_HOLIDAYS = [
  { month: 1, day: 1, name: '설날' },
  { month: 1, day: 2, name: '설날' },
  { month: 8, day: 15, name: '추석' },
  { month: 8, day: 16, name: '추석' },
];

// 양력 공휴일 (매년 고정)
const SOLAR_HOLIDAYS = [
  { month: 1, day: 1, name: '신정' },
  { month: 3, day: 1, name: '삼일절' },
  { month: 5, day: 5, name: '어린이날' },
  { month: 6, day: 6, name: '현충일' },
  { month: 8, day: 15, name: '광복절' },
  { month: 10, day: 3, name: '개천절' },
  { month: 10, day: 9, name: '한글날' },
  { month: 12, day: 25, name: '크리스마스' },
];

// 부처님 오신 날 (음력 4월 8일)
const BUDDHA_BIRTHDAY = { month: 4, day: 8, name: '부처님오신날' };

// 대체공휴일 규칙
const SUBSTITUTE_HOLIDAY_RULES = [
  { original: '어린이날', substitute: '어린이날 대체공휴일' },
  { original: '추석', substitute: '추석 대체공휴일' },
  { original: '설날', substitute: '설날 대체공휴일' },
];

// 음력 날짜를 양력으로 변환하는 간단한 함수 (정확하지 않으므로 실제로는 API 사용 권장)
function lunarToSolar(year: number, month: number, day: number): Date {
  // 간단한 근사치 계산 (실제로는 정확한 음력-양력 변환 라이브러리 사용 필요)
  const lunarDate = new Date(year, month - 1, day);
  // 음력과 양력의 차이는 보통 1-2개월 정도
  lunarDate.setMonth(lunarDate.getMonth() + 1);
  return lunarDate;
}

// 특정 연도의 공휴일 목록 생성
export function getHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // 양력 공휴일 추가
  SOLAR_HOLIDAYS.forEach(holiday => {
    const date = new Date(year, holiday.month - 1, holiday.day);
    holidays.push({
      date: date.toISOString().split('T')[0],
      name: holiday.name,
      type: 'national'
    });
  });

  // 음력 공휴일 추가 (근사치)
  LUNAR_HOLIDAYS.forEach(holiday => {
    const solarDate = lunarToSolar(year, holiday.month, holiday.day);
    holidays.push({
      date: solarDate.toISOString().split('T')[0],
      name: holiday.name,
      type: 'national'
    });
  });

  // 부처님 오신 날 추가
  const buddhaDate = lunarToSolar(year, BUDDHA_BIRTHDAY.month, BUDDHA_BIRTHDAY.day);
  holidays.push({
    date: buddhaDate.toISOString().split('T')[0],
    name: BUDDHA_BIRTHDAY.name,
    type: 'national'
  });

  // 대체공휴일 추가 (간단한 규칙)
  // 실제로는 정부 공식 발표에 따라 결정됨
  const substituteHolidays = getSubstituteHolidays(year);
  holidays.push(...substituteHolidays);

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

// 대체공휴일 계산 (간단한 규칙)
function getSubstituteHolidays(year: number): Holiday[] {
  const substitutes: Holiday[] = [];
  
  // 어린이날이 주말인 경우 다음 평일을 대체공휴일로
  const childrensDay = new Date(year, 4, 5); // 5월 5일
  const childrensDayOfWeek = childrensDay.getDay();
  
  if (childrensDayOfWeek === 0) { // 일요일
    const substituteDate = new Date(year, 4, 6); // 5월 6일
    substitutes.push({
      date: substituteDate.toISOString().split('T')[0],
      name: '어린이날 대체공휴일',
      type: 'substitute'
    });
  } else if (childrensDayOfWeek === 6) { // 토요일
    const substituteDate = new Date(year, 4, 7); // 5월 7일
    substitutes.push({
      date: substituteDate.toISOString().split('T')[0],
      name: '어린이날 대체공휴일',
      type: 'substitute'
    });
  }

  return substitutes;
}

// 특정 월의 공휴일 목록
export function getHolidaysForMonth(year: number, month: number): Holiday[] {
  const allHolidays = getHolidaysForYear(year);
  return allHolidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.getFullYear() === year && holidayDate.getMonth() === month - 1;
  });
}

// 특정 날짜가 공휴일인지 확인
export function isHoliday(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const holidays = getHolidaysForMonth(year, month);
  return holidays.some(holiday => holiday.date === date);
}

// 공휴일 이름 가져오기
export function getHolidayName(date: string): string | null {
  const [year, month, day] = date.split('-').map(Number);
  const holidays = getHolidaysForMonth(year, month);
  const holiday = holidays.find(h => h.date === date);
  return holiday ? holiday.name : null;
}

// 외부 API를 사용한 정확한 공휴일 정보 (선택사항)
export async function fetchHolidaysFromAPI(year: number): Promise<Holiday[]> {
  try {
    // 공공데이터포털 API 또는 다른 공휴일 API 사용
    // 실제 구현 시에는 API 키와 엔드포인트가 필요
    const response = await fetch(`https://api.example.com/holidays/${year}`);
    if (response.ok) {
      const data = await response.json();
      return data.holidays || [];
    }
  } catch (error) {
    console.warn('공휴일 API 호출 실패, 기본 계산 사용:', error);
  }
  
  // API 실패 시 기본 계산 사용
  return getHolidaysForYear(year);
} 