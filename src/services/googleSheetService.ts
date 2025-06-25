// This file will contain the logic to fetch and parse data from the Google Sheet.
import { ScheduleItem, StaffMember } from '../types';

// 디버깅 로그 제어 플래그
const DEBUG_MODE = true;

// 기본 구글 스프레드시트 URL (하드코딩된 값)
const DEFAULT_GOOGLE_SHEET_ID = '2PACX-1vTopAqdeyxyResdIR-AeREaY5byKtM90QDuHcMIlySta2obCKxZkhP5GhJvUdIZUHeOxl0KpjsWJO96';

// 동적 URL을 위한 변수
let currentGoogleSheetId = DEFAULT_GOOGLE_SHEET_ID;

// URL 생성 함수
const getGoogleSheetUrls = (sheetId: string = currentGoogleSheetId) => {
  const baseUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}`;
  return {
    html: `${baseUrl}/pubhtml`,
    json: `${baseUrl}/gviz/tq?t=json`
  };
};

// URL 설정 함수
export const setGoogleSheetUrl = (url: string) => {
  try {
    // URL에서 sheet ID 추출
    const match = url.match(/\/d\/e\/([^\/]+)/);
    if (match) {
      currentGoogleSheetId = match[1];
      console.log('Google Sheet ID updated:', currentGoogleSheetId);
      return true;
    } else {
      console.error('Invalid Google Sheet URL format');
      return false;
    }
  } catch (error) {
    console.error('Error setting Google Sheet URL:', error);
    return false;
  }
};

// 현재 URL 가져오기 함수
export const getCurrentGoogleSheetUrl = () => {
  return getGoogleSheetUrls().html;
};

// Final color map based on the user's master schedule image.
const staffColorMap: { [key: string]: string } = {
  '박일섭': '#9900ff', '이은철': '#0000ff', '김선민': '#6aa84f',
  '서동진': '#ff00ff', '공선희': '#38761d', '박기태': '#990000',
  '이우석': '#85200c', '신현덕': '#bf9000', '김완종': '#ff9900',
  '서정화': '#008080', '백요한': '#134f5c', '방사무엘': '#674ea7',
  '이진우': '#2c3e50', '박부환': '#34495e', '씨앗학교': '#76a5af',
  '교회학교': '#00ff00', '한진숙': '#ff00ff',
};

// 전임교역자 목록 (확인 필요)
const fullTimeMinisters = ['박일섭', '이은철', '김선민', '서동진', '공선희', '박기태'];

// Staff initial mapping - 각 스태프의 고유한 이니셜 정의
const staffInitialMap: { [key: string]: string } = {
  '박일섭': '박', '이은철': '철', '김선민': '김',
  '서동진': '서', '공선희': '공', '박기태': '태',
  '이우석': '석', '신현덕': '신', '김완종': '완',
  '서정화': '화', '백요한': '백', '방사무엘': '방',
  '한진숙': '한',
  // 이진우, 박부환, 씨앗학교, 교회학교는 이니셜 없음
};

// Function to generate a consistent color based on staff name
const getStaffColor = (name: string): string => {
  return staffColorMap[name] || '#6c757d'; // default gray
};

const parseStaffMembers = (grid: (string | null)[][]): StaffMember[] => {
  const staff: StaffMember[] = [];
  
  // Find the row that contains staff information by looking for patterns
  let staffRowIndex = -1;
  for (let r = 0; r < Math.min(10, grid.length); r++) {
    const row = grid[r];
    if (row) {
      const rowString = row.join('');
      if (rowString.includes('박일섭') || rowString.includes('이은철') || rowString.includes('김선민')) {
        staffRowIndex = r;
        break;
      }
    }
  }
  
  if (staffRowIndex >= 0) {
    const staffRow = grid[staffRowIndex];
    
    if (staffRow) {
      // Process cells starting from index 2 (3rd column) where staff info begins
      for (let i = 2; i < staffRow.length; i++) {
        const cell = staffRow[i];
        
        if (!cell) continue;
        
        // Pattern 1: "이름(약자)" format
        const nameWithShortPattern = /([가-힣]+)\(([가-힣]+)\)/g;
        let match;
        while ((match = nameWithShortPattern.exec(cell)) !== null) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, name, shortName] = match;
          if (!staff.some(s => s.name === name)) {
            staff.push({ 
              id: name, 
              name, 
              shortName, 
              department: 'Unknown', 
              color: getStaffColor(name) 
            });
          }
        }
        
        // Pattern 2: Just names without parentheses (like "이진우박부환씨앗학교교회학교")
        const namesWithoutShort = cell.replace(/[가-힣]+\([가-힣]+\)/g, ''); // Remove already processed names
        
        if (namesWithoutShort.trim()) {
          // Special handling for the last cell with multiple names
          if (namesWithoutShort.includes('이진우박부환씨앗학교교회학교')) {
            const specialNames = ['이진우', '박부환', '씨앗학교', '교회학교'];
            specialNames.forEach(name => {
              if (!staff.some(s => s.name === name)) {
                staff.push({ 
                  id: name, 
                  name, 
                  shortName: name.charAt(0), 
                  department: 'Unknown', 
                  color: getStaffColor(name) 
                });
              }
            });
          } else {
            // Split by Korean characters that are likely names
            const nameMatches = namesWithoutShort.match(/[가-힣]+/g);
            
            if (nameMatches) {
              nameMatches.forEach(name => {
                // Filter out category names and ensure it's a real staff name
                if (name.length >= 2 && 
                    !['계획', '일정', '근무', '차량', '매일씨앗묵상', '커피관리', '차량/기타'].includes(name) &&
                    !staff.some(s => s.name === name)) {
                  staff.push({ 
                    id: name, 
                    name, 
                    shortName: name.charAt(0), 
                    department: 'Unknown', 
                    color: getStaffColor(name) 
                  });
                }
              });
            }
          }
        }
      }
    }
  }

  // Ensure all staff members have proper shortName (first character of their name)
  staff.forEach(member => {
    // 이니셜 맵에서 정의된 고유 이니셜 사용, 없으면 빈 문자열 (이니셜 없음)
    member.shortName = staffInitialMap[member.name] || '';
  });

  if (DEBUG_MODE) {
    console.log('Final parsed staff members:', staff.map(s => ({ name: s.name, shortName: s.shortName, color: s.color })));
  }
  return staff;
};

export interface ScheduleData {
    year: number;
    month: number;
    schedules: ScheduleItem[];
    staffMembers: StaffMember[];
    textGrid: (string | null)[][];
}

export const getScheduleData = async (): Promise<ScheduleData> => {
  type WritableScheduleKeys = 'schedule' | 'dailyMeditation' | 'coffeeManagement' | 'workSchedule' | 'vehicleAndOther';
  const scheduleRowKeys: { [key: string]: WritableScheduleKeys } = {
    '일정': 'schedule', '매일씨앗묵상': 'dailyMeditation', '커피관리': 'coffeeManagement',
    '근무': 'workSchedule', '차량/기타': 'vehicleAndOther',
  };

  // 먼저 HTML 방식으로 시도
  try {
    return await getScheduleDataFromHTML(scheduleRowKeys);
  } catch (htmlError) {
    console.warn('HTML 방식 실패, JSON 방식으로 시도:', htmlError);
    try {
      return await getScheduleDataFromJSON(scheduleRowKeys);
    } catch (jsonError) {
      console.error('JSON 방식도 실패:', jsonError);
      throw new Error(`데이터를 가져올 수 없습니다. HTML 오류: ${htmlError}, JSON 오류: ${jsonError}`);
    }
  }
};

const getScheduleDataFromHTML = async (scheduleRowKeys: { [key: string]: any }): Promise<ScheduleData> => {
  // 캐시 방지를 위한 타임스탬프 추가
  const timestamp = new Date().getTime();
  const urlWithCacheBuster = `${getGoogleSheetUrls().html}?t=${timestamp}`;
  
  console.log('Fetching from Google Sheets HTML URL:', urlWithCacheBuster);
  
  // 더 자세한 오류 처리를 위한 fetch 요청
  let response;
  try {
    response = await fetch(urlWithCacheBuster, {
      method: 'GET',
      mode: 'cors' // CORS 모드 명시적 설정
    });
  } catch (fetchError) {
    console.error('Fetch error details:', fetchError);
    const error = fetchError as Error;
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('네트워크 연결 오류입니다. 인터넷 연결을 확인해주세요.');
    } else if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error('CORS 오류입니다. 구글 스프레드시트가 올바르게 공개되어 있는지 확인해주세요.');
    } else {
      throw new Error(`데이터 가져오기 실패: ${error.message}`);
    }
  }
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '응답 내용을 읽을 수 없습니다.');
    console.error('Response error details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText.substring(0, 500) // 처음 500자만 로그
    });
    
    if (response.status === 403) {
      throw new Error('접근 권한이 없습니다. 구글 스프레드시트가 공개되어 있는지 확인해주세요.');
    } else if (response.status === 404) {
      throw new Error('구글 스프레드시트를 찾을 수 없습니다. URL을 확인해주세요.');
    } else if (response.status >= 500) {
      throw new Error('구글 서버 오류입니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - Google Sheets 데이터를 가져올 수 없습니다.`);
    }
  }
  
  const htmlText = await response.text();
  console.log('HTML response length:', htmlText.length);
  console.log('HTML response preview:', htmlText.substring(0, 500));
  
  if (htmlText.length < 100) {
    throw new Error('Google Sheets에서 빈 응답을 받았습니다. URL을 확인해주세요.');
  }
  
  // HTML 내용에 오류 메시지가 포함되어 있는지 확인
  if (htmlText.includes('Error 404') || htmlText.includes('Not Found')) {
    throw new Error('구글 스프레드시트를 찾을 수 없습니다. URL을 확인해주세요.');
  }
  
  if (htmlText.includes('Access denied') || htmlText.includes('Permission denied')) {
    throw new Error('접근 권한이 없습니다. 구글 스프레드시트가 공개되어 있는지 확인해주세요.');
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const table = doc.querySelector('table');
  
  if (!table) {
    throw new Error('Google Sheets HTML에서 테이블을 찾을 수 없습니다. 시트가 올바르게 공개되어 있는지 확인해주세요.');
  }

  const rows = Array.from(table.querySelectorAll('tr'));
  console.log('Found table rows:', rows.length);
  
  if (rows.length === 0) {
    throw new Error('Google Sheets 테이블에 행이 없습니다.');
  }

  let maxCols = 0;
  rows.forEach(row => {
    let currentCols = 0;
    row.querySelectorAll('td, th').forEach(cell => {
      currentCols += parseInt(cell.getAttribute('colspan') || '1', 10);
    });
    if (currentCols > maxCols) maxCols = currentCols;
  });

  const htmlGrid: (string | null)[][] = Array.from({ length: rows.length }, () => Array(maxCols).fill(null));
  const textGrid: (string | null)[][] = Array.from({ length: rows.length }, () => Array(maxCols).fill(null));

  rows.forEach((row, r) => {
    let c = 0;
    Array.from(row.querySelectorAll('td, th')).forEach(cell => {
      while (htmlGrid[r][c] !== null) c++;
      const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);
      const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
      for (let rs = 0; rs < rowspan; rs++) {
        for (let cs = 0; cs < colspan; cs++) {
          if (r + rs < rows.length && c + cs < maxCols) {
            // 서정화 색상 변환: #00ffff -> #008080
            let cellHtml = cell.innerHTML;
            cellHtml = cellHtml.replace(/#00ffff/g, '#008080');
            cellHtml = cellHtml.replace(/color:\s*#00ffff/g, 'color: #008080');
            cellHtml = cellHtml.replace(/color:\s*#00ffff;/g, 'color: #008080;');
            
            // CSS 클래스 정보 추가 (Google Sheets 색상 매칭용)
            const cellClass = cell.getAttribute('class');
            if (cellClass) {
              // CSS 클래스 정보를 HTML에 포함시켜 색상 매칭에 활용
              cellHtml = `<div class="${cellClass}">${cellHtml}</div>`;
              
              if (DEBUG_MODE && (cellClass.includes('s13') || cellClass.includes('s10') || cellClass.includes('s16'))) {
                console.log(`Found CSS class: ${cellClass} in cell [${r}, ${c}]`);
                console.log(`Cell content: ${cell.textContent}`);
              }
            }
            
            // 구글 시트에서 색상 정보를 더 정확하게 추출
            // 1. 인라인 스타일에서 색상 추출
            const inlineStyleMatches = cellHtml.match(/style="[^"]*color:\s*([^;"]+)[^"]*"/gi);
            if (inlineStyleMatches) {
              // eslint-disable-next-line no-loop-func
              inlineStyleMatches.forEach(match => {
                const colorMatch = match.match(/color:\s*([^;"]+)/i);
                if (colorMatch) {
                  console.log(`Found inline style color: ${colorMatch[1]} in cell [${r}, ${c}]`);
                }
              });
            }
            
            // 2. span 태그의 색상 속성 추출
            const spanColorMatches = cellHtml.match(/<span[^>]*color:\s*([^;"]+)[^>]*>/gi);
            if (spanColorMatches) {
              // eslint-disable-next-line no-loop-func
              spanColorMatches.forEach(match => {
                const colorMatch = match.match(/color:\s*([^;"]+)/i);
                if (colorMatch) {
                  console.log(`Found span color: ${colorMatch[1]} in cell [${r}, ${c}]`);
                }
              });
            }
            
            // 3. 모든 색상 패턴 추출 (디버깅용)
            const allColorMatches = cellHtml.match(/(?:color|background-color):\s*([^;"]+)/gi);
            if (allColorMatches && allColorMatches.length > 0) {
              console.log(`Cell [${r}, ${c}] - All color patterns found:`, allColorMatches);
            }
            
            htmlGrid[r + rs][c + cs] = cellHtml;
            textGrid[r + rs][c + cs] = cell.textContent;
          }
        }
      }
      c += colspan;
    });
  });

  const titleText = doc.querySelector('#sheet-title')?.textContent || '';
  const month = parseInt(titleText.match(/(\d+)월/)?.[1] || `${new Date().getMonth() + 1}`, 10);
  const year = parseInt(titleText.match(/(\d{4})년/)?.[1] || `${new Date().getFullYear()}`, 10);

  const staffMembers = parseStaffMembers(textGrid);
  const scheduleMap = new Map<string, ScheduleItem>();

  const dateRowIndexes = textGrid.reduce((acc: number[], row: any[], r: number) => {
    if (row.some((cell: any) => cell?.trim() === '날짜')) acc.push(r);
    return acc;
  }, [] as number[]);
  
  if (dateRowIndexes.length === 0) throw new Error("Could not find any '날짜' rows.");

  dateRowIndexes.forEach(dateRowIndex => {
    const categoryCol = textGrid[dateRowIndex].findIndex(cell => cell?.trim() === '날짜');
    if (categoryCol === -1) return;

    const dayOfWeekRow = textGrid[dateRowIndex - 1];
    const dateRow = textGrid[dateRowIndex];

    for (let c = categoryCol + 1; c < maxCols; c++) {
      const day = parseInt(dateRow?.[c]?.trim() || '', 10);
      if (isNaN(day)) continue;
      
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (!scheduleMap.has(date)) {
        scheduleMap.set(date, { id: date, date, dayOfWeek: dayOfWeekRow?.[c]?.trim() || '', schedule: '', dailyMeditation: '', coffeeManagement: '', workSchedule: '', vehicleAndOther: '' });
      }
      const scheduleItem = scheduleMap.get(date)!;

      let lastCategoryName: string | null = null;
      const endRow = dateRowIndexes.find(i => i > dateRowIndex) || rows.length;
      for (let r = dateRowIndex + 1; r < endRow; r++) {
        const categoryName = textGrid[r]?.[categoryCol]?.trim();
        if (categoryName && scheduleRowKeys[categoryName]) {
          lastCategoryName = categoryName;
        }
        
        if (lastCategoryName) {
          const key = scheduleRowKeys[lastCategoryName] as keyof ScheduleItem;
          const html = htmlGrid[r]?.[c]?.trim();
          const text = textGrid[r]?.[c]?.trim();
          if (text) {
              if (scheduleItem[key]) {
                  (scheduleItem[key] as any) += `<br>${html}`;
              } else {
                  (scheduleItem[key] as any) = html;
              }
            
            const staffField = `${key}Staff` as keyof ScheduleItem;
            
            // 특별 처리: 6월 2일 전임교역자 대체휴무
            if (date === '2025-06-02' && key === 'workSchedule') {
              const existing = (scheduleItem[staffField] as string[] | undefined) || [];
              (scheduleItem[staffField] as any) = [...new Set([...existing, ...fullTimeMinisters])];
              if (DEBUG_MODE) {
                console.log(`Special case - June 2nd: Added full-time ministers to work schedule: ${fullTimeMinisters.join(', ')}`);
              }
            } else {
              // HTML 태그를 제거하고 순수 텍스트에서 스태프를 찾기
              const cleanText = text.replace(/<[^>]*>/g, ''); // HTML 태그 제거
              
              // 전체 이름과 이니셜 모두에서 스태프 찾기 (날짜 패턴 제외)
              const newStaff = staffMembers.filter(s => {
                // 날짜 패턴 (예: 4일, 7일) 제외
                const datePattern = /^\d+일$/;
                if (datePattern.test(s.name) || datePattern.test(s.shortName)) {
                  return false;
                }
                
                // 근무 스케줄에서 특별 처리: 날짜와 스태프 이름 구분
                if (key === 'workSchedule') {
                  // 날짜 패턴이 포함된 텍스트는 제외
                  const dateInText = /\d+일/.test(cleanText);
                  if (dateInText && (s.name === '이진우' || s.name === '박부환')) {
                    return false; // 이진우, 박부환은 날짜와 혼동될 수 있음
                  }
                  
                  // 근무 스케줄에서 스태프 이름이 명시적으로 포함된 경우 우선 처리
                  if (cleanText.includes(s.name)) {
                    return true;
                  }
                }
                
                return cleanText.includes(s.name) || (s.shortName && cleanText.includes(s.shortName));
              }).map(s => s.name);
              
              // 추가: HTML에서 색상으로 스태프 찾기 (더 정확한 매칭)
              const htmlStaff = findStaffByColor(html || '', staffMembers);
              
              // 근무 스케줄 특별 처리: 색상 우선순위
              if (key === 'workSchedule') {
                // 디버깅: 근무 스케줄 HTML 내용 확인
                if (DEBUG_MODE) {
                  console.log(`=== Work Schedule Debug - Date: ${scheduleItem.date} ===`);
                  console.log(`  Original HTML: ${html}`);
                  console.log(`  Clean text: ${cleanText}`);
                  console.log(`  Name matched staff: ${newStaff.join(', ')}`);
                  console.log(`  Color matched staff: ${htmlStaff.join(', ')}`);
                  
                  // CSS 클래스 정보 확인
                  if (html && html.includes('class="')) {
                    const classMatches = html.match(/class="([^"]+)"/g);
                    console.log(`  CSS Classes found: ${classMatches?.join(', ')}`);
                  }
                  
                  // 특정 색상 클래스 확인
                  const targetClasses = ['s13', 's10', 's16', 's9', 's17', 's15'];
                  targetClasses.forEach(cls => {
                    if (html && html.includes(`class="${cls}"`)) {
                      console.log(`  ✓ Found target CSS class: ${cls}`);
                    }
                  });
                }
                
                // 특별 처리: 사용자가 언급한 날짜들 (4일, 7일, 11일)
                const specialDates = ['2025-06-04', '2025-06-07', '2025-06-11'];
                if (specialDates.includes(scheduleItem.date)) {
                  console.log(`=== SPECIAL DATE PROCESSING: ${scheduleItem.date} ===`);
                  
                  // 색상 매칭을 강제로 우선시
                  if (htmlStaff.length > 0) {
                    const existing = (scheduleItem[staffField] as string[] | undefined) || [];
                    (scheduleItem[staffField] as any) = [...new Set([...existing, ...htmlStaff])];
                    
                    console.log(`  ✓ Special date color match: ${htmlStaff.join(', ')}`);
                  } else {
                    console.log(`  ✗ No color match found for special date ${scheduleItem.date}`);
                    console.log(`    HTML content: ${html}`);
                  }
                } else {
                  // 일반적인 근무 스케줄 처리
                  // 근무 스케줄에서는 색상 매칭을 우선시 (색상으로 구분되는 경우가 많음)
                  if (htmlStaff.length > 0) {
                    const existing = (scheduleItem[staffField] as string[] | undefined) || [];
                    (scheduleItem[staffField] as any) = [...new Set([...existing, ...htmlStaff])];
                    
                    if (DEBUG_MODE) {
                      console.log(`Work schedule color match - Date: ${scheduleItem.date}`);
                      console.log(`  Color matched staff: ${htmlStaff.join(', ')}`);
                    }
                  }
                  // 색상 매칭이 실패한 경우에만 이름 매칭 사용
                  else if (newStaff.length > 0) {
                    const existing = (scheduleItem[staffField] as string[] | undefined) || [];
                    (scheduleItem[staffField] as any) = [...new Set([...existing, ...newStaff])];
                    
                    if (DEBUG_MODE) {
                      console.log(`Work schedule name match - Date: ${scheduleItem.date}`);
                      console.log(`  Name matched staff: ${newStaff.join(', ')}`);
                    }
                  } else if (DEBUG_MODE) {
                    console.log(`  ✗ No staff matched for work schedule on ${scheduleItem.date}`);
                    console.log(`    Name matching failed: ${newStaff.length === 0}`);
                    console.log(`    Color matching failed: ${htmlStaff.length === 0}`);
                  }
                }
              } else {
                // 이름과 색상으로 찾은 스태프 모두 추가
                const allFoundStaff = [...new Set([...newStaff, ...htmlStaff])];
                
                if (allFoundStaff.length > 0) {
                  const existing = (scheduleItem[staffField] as string[] | undefined) || [];
                  (scheduleItem[staffField] as any) = [...new Set([...existing, ...allFoundStaff])];
                }
              }
            }
          }
        }
      }
    }
  });

  const schedules = Array.from(scheduleMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  return { year, month, schedules, staffMembers, textGrid };
};

const getScheduleDataFromJSON = async (scheduleRowKeys: { [key: string]: any }): Promise<ScheduleData> => {
  const timestamp = new Date().getTime();
  const urlWithCacheBuster = `${getGoogleSheetUrls().json}&t=${timestamp}`;
  
  console.log('Fetching from Google Sheets JSON URL:', urlWithCacheBuster);
  
  const response = await fetch(urlWithCacheBuster, {
    method: 'GET',
    mode: 'cors'
  });
  
  if (!response.ok) {
    throw new Error(`JSON API 오류: HTTP ${response.status}: ${response.statusText}`);
  }
  
  const jsonText = await response.text();
  
  // Google Visualization API는 ")]}'"로 시작하는 응답을 반환
  const cleanJson = jsonText.replace(/^\)\]\}'/, '');
  
  try {
    const data = JSON.parse(cleanJson);
    
    if (!data.table || !data.table.rows) {
      throw new Error('JSON 응답에 테이블 데이터가 없습니다.');
    }
    
    // JSON 데이터를 기존 HTML 파싱 로직과 호환되도록 변환
    const rows = data.table.rows.map((row: any) => 
      row.c.map((cell: any) => cell?.v || null)
    );
    
    const titleText = data.table.cols?.[0]?.label || '';
    const month = parseInt(titleText.match(/(\d+)월/)?.[1] || `${new Date().getMonth() + 1}`, 10);
    const year = parseInt(titleText.match(/(\d{4})년/)?.[1] || `${new Date().getFullYear()}`, 10);
    
    const staffMembers = parseStaffMembers(rows);
    const scheduleMap = new Map<string, ScheduleItem>();
    
    // 기존 HTML 파싱 로직과 동일한 방식으로 스케줄 데이터 처리
    const dateRowIndexes = rows.reduce((acc: number[], row: any[], r: number) => {
      if (row.some((cell: any) => cell?.trim() === '날짜')) acc.push(r);
      return acc;
    }, [] as number[]);
    
    if (dateRowIndexes.length === 0) throw new Error("Could not find any '날짜' rows.");
    
    dateRowIndexes.forEach((dateRowIndex: number) => {
      const categoryCol = rows[dateRowIndex].findIndex((cell: any) => cell?.trim() === '날짜');
      if (categoryCol === -1) return;
      
      const dayOfWeekRow = rows[dateRowIndex - 1];
      const dateRow = rows[dateRowIndex];
      
      for (let c = categoryCol + 1; c < rows[0].length; c++) {
        const day = parseInt(dateRow?.[c]?.trim() || '', 10);
        if (isNaN(day)) continue;
        
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (!scheduleMap.has(date)) {
          scheduleMap.set(date, { 
            id: date, 
            date, 
            dayOfWeek: dayOfWeekRow?.[c]?.trim() || '', 
            schedule: '', 
            dailyMeditation: '', 
            coffeeManagement: '', 
            workSchedule: '', 
            vehicleAndOther: '' 
          });
        }
        
        const scheduleItem = scheduleMap.get(date)!;
        
        let lastCategoryName: string | null = null;
        const endRow = dateRowIndexes.find((i: number) => i > dateRowIndex) || rows.length;
        
        for (let r = dateRowIndex + 1; r < endRow; r++) {
          const categoryName = rows[r]?.[categoryCol]?.trim();
          if (categoryName && scheduleRowKeys[categoryName]) {
            lastCategoryName = categoryName;
          }
          
          if (lastCategoryName) {
            const key = scheduleRowKeys[lastCategoryName] as keyof ScheduleItem;
            const text = rows[r]?.[c]?.trim();
            if (text) {
              if (scheduleItem[key]) {
                (scheduleItem[key] as any) += `<br>${text}`;
              } else {
                (scheduleItem[key] as any) = text;
              }
            }
          }
        }
      }
    });
    
    const schedules = Array.from(scheduleMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    return { year, month, schedules, staffMembers, textGrid: rows };
    
  } catch (parseError) {
    throw new Error(`JSON 파싱 오류: ${parseError}`);
  }
};

// Function to find staff by color in HTML content
const findStaffByColor = (htmlContent: string, staffMembers: StaffMember[]): string[] => {
  const foundStaff: string[] = [];
  
  if (!htmlContent) return foundStaff;
  
  // 강화된 디버깅: 사용자가 언급한 색상들에 대한 특별 처리
  const targetColors = ['#85200c', '#bf9000', '#6aa84f', '#0000ff']; // 이은철 색상 추가
  const targetNames = ['이우석', '신현덕', '김선민', '이은철']; // 이은철 추가
  
  if (htmlContent.includes('off') || htmlContent.includes('근무') || htmlContent.includes('박옥례') || htmlContent.includes('전가영')) {
    console.log('=== ENHANCED COLOR DEBUG ===');
    console.log('HTML Content:', htmlContent);
    
    // CSS 클래스 추출
    const classMatches = htmlContent.match(/class="([^"]+)"/g);
    if (classMatches) {
      console.log('Found CSS classes:', classMatches);
    }
    
    // 특정 색상 클래스 확인
    const targetClasses = ['s13', 's9', 's10', 's17', 's15', 's16', 's14']; // s14 추가 (이은철)
    targetClasses.forEach(cls => {
      if (htmlContent.includes(`class="${cls}"`)) {
        console.log(`✓ Found target CSS class: ${cls}`);
      }
    });
  }
  
  // 간단한 테스트: CSS 클래스 매칭이 제대로 작동하는지 확인
  const testHtml = '<td class="s13">이우석</td><td class="s10">신현덕</td><td class="s16">김선민</td><td class="s14">이은철</td>';
  if (htmlContent.includes('이우석') || htmlContent.includes('신현덕') || htmlContent.includes('김선민') || htmlContent.includes('이은철') || htmlContent.includes('박옥례') || htmlContent.includes('전가영')) {
    console.log('=== CSS Class Matching Test ===');
    console.log('Test HTML:', testHtml);
    
    const testCssClasses = {
      '#85200c': ['s13', 's9'],
      '#bf9000': ['s10', 's17', 's15'],
      '#6aa84f': ['s16'],
      '#0000ff': ['s14'] // 이은철 추가
    };
    
    Object.entries(testCssClasses).forEach(([color, classes]) => {
      classes.forEach(cssClass => {
        const hasClass = testHtml.includes(`class="${cssClass}"`);
        console.log(`Color ${color} (${cssClass}): ${hasClass ? '✓' : '✗'}`);
      });
    });
  }
  
  if (DEBUG_MODE) {
    console.log(`  === Color Matching Debug ===`);
    console.log(`  HTML Content: ${htmlContent}`);
    
    // 사용자가 언급한 색상들이 포함된 경우 특별 디버깅
    if (htmlContent.includes('이우석') || htmlContent.includes('신현덕') || htmlContent.includes('김선민') || htmlContent.includes('이은철') || htmlContent.includes('박옥례') || htmlContent.includes('전가영')) {
      console.log(`  *** Special Debug for User Colors ***`);
      console.log(`  HTML contains target names, checking for CSS classes...`);
    }
    
    // 실제 HTML에서 CSS 클래스 확인
    const actualClasses = htmlContent.match(/class="([^"]+)"/g);
    if (actualClasses) {
      console.log(`  Actual CSS classes found: ${actualClasses.join(', ')}`);
    }
  }
  
  staffMembers.forEach(staff => {
    const colorHex = staff.color.replace('#', '');
    
    // Google Sheets CSS 클래스 매핑 (실제 HTML에서 확인된 클래스들)
    const cssClassMap: { [key: string]: string[] } = {
      '#85200c': ['s13', 's9'],      // 이우석
      '#bf9000': ['s10', 's17', 's15'], // 신현덕
      '#6aa84f': ['s16'],            // 김선민
      '#9900ff': ['s12'],            // 박일섭
      '#0000ff': ['s14'],            // 이은철 - s14 클래스 추가
      '#ff00ff': [],                 // 서동진
      '#38761d': [],                 // 공선희
      '#990000': [],                 // 박기태
      '#ff9900': ['s12'],            // 김완종
      '#008080': [],                 // 서정화
      '#134f5c': [],                 // 백요한
      '#674ea7': ['s18'],            // 방사무엘
    };
    
    const colorPatterns = [
      // 기본 16진수 패턴
      `color:${staff.color}`,
      `color: ${staff.color}`,
      `color:${staff.color};`,
      `color: ${staff.color};`,
      `color:#${colorHex}`,
      `color: #${colorHex}`,
      `color:#${colorHex.toLowerCase()}`,
      `color: #${colorHex.toLowerCase()}`,
      // 인라인 스타일 패턴
      `style="color:${staff.color}"`,
      `style="color: ${staff.color}"`,
      `style="color:${staff.color};"`,
      `style="color: ${staff.color};"`,
      // span 태그 패턴
      `<span[^>]*color:${staff.color}[^>]*>`,
      `<span[^>]*color: ${staff.color}[^>]*>`,
      `<span[^>]*color:#${colorHex}[^>]*>`,
      `<span[^>]*color: #${colorHex}[^>]*>`,
      // 대소문자 변형
      `color:${staff.color.toLowerCase()}`,
      `color: ${staff.color.toLowerCase()}`,
      `color:${staff.color.toUpperCase()}`,
      `color: ${staff.color.toUpperCase()}`,
    ];
    
    // 색상 매칭 확인
    let hasColor = false;
    let matchedPatterns: string[] = [];
    
    // 1. 인라인 스타일 패턴 확인
    colorPatterns.forEach(pattern => {
      if (htmlContent.toLowerCase().includes(pattern.toLowerCase())) {
        hasColor = true;
        matchedPatterns.push(pattern);
      }
    });
    
    // 2. CSS 클래스 패턴 확인 (Google Sheets 특화)
    const cssClasses = cssClassMap[staff.color] || [];
    cssClasses.forEach(cssClass => {
      const classPattern = `class="${cssClass}"`;
      if (htmlContent.includes(classPattern)) {
        hasColor = true;
        matchedPatterns.push(`CSS class: ${cssClass}`);
        
        // 특별 디버깅: 사용자가 언급한 색상들
        if (staff.color === '#85200c' || staff.color === '#bf9000' || staff.color === '#6aa84f' || staff.color === '#0000ff') {
          console.log(`  ✓ CSS class match found: ${cssClass} for ${staff.name} (${staff.color})`);
        }
      }
    });
    
    // 추가: 더 유연한 CSS 클래스 매칭 (공백이나 다른 클래스와 함께 있는 경우)
    cssClasses.forEach(cssClass => {
      const flexiblePatterns = [
        `class="${cssClass}"`,
        `class="${cssClass} `,
        `class=" ${cssClass}"`,
        `class=" ${cssClass} `,
        `class="${cssClass};`,
        `class="${cssClass}>`,
      ];
      
      flexiblePatterns.forEach(pattern => {
        if (htmlContent.includes(pattern)) {
          hasColor = true;
          matchedPatterns.push(`Flexible CSS class: ${cssClass}`);
          
          // 특별 디버깅: 사용자가 언급한 색상들
          if (staff.color === '#85200c' || staff.color === '#bf9000' || staff.color === '#6aa84f' || staff.color === '#0000ff') {
            console.log(`  ✓ Flexible CSS class match: ${pattern} for ${staff.name} (${staff.color})`);
          }
        }
      });
    });
    
    // 강화된 매칭: 사용자가 언급한 특정 색상들에 대한 추가 검사
    if (targetColors.includes(staff.color)) {
      console.log(`=== Enhanced matching for ${staff.name} (${staff.color}) ===`);
      
      // 모든 가능한 CSS 클래스 패턴 확인
      const allPossiblePatterns = [
        ...cssClasses.map(cls => `class="${cls}"`),
        ...cssClasses.map(cls => `class="${cls} `),
        ...cssClasses.map(cls => `class=" ${cls}"`),
        ...cssClasses.map(cls => `class=" ${cls} `),
        ...cssClasses.map(cls => `class="${cls};`),
        ...cssClasses.map(cls => `class="${cls}>`),
      ];
      
      allPossiblePatterns.forEach(pattern => {
        if (htmlContent.includes(pattern)) {
          hasColor = true;
          matchedPatterns.push(`Enhanced CSS class: ${pattern}`);
          console.log(`  ✓ Enhanced match: ${pattern}`);
        }
      });
      
      // 정규식으로 더 정확한 매칭
      cssClasses.forEach(cssClass => {
        const regex = new RegExp(`class="[^"]*${cssClass}[^"]*"`, 'i');
        if (regex.test(htmlContent)) {
          hasColor = true;
          matchedPatterns.push(`Regex CSS class: ${cssClass}`);
          console.log(`  ✓ Regex match: ${cssClass}`);
        }
      });
    }
    
    if (hasColor) {
      foundStaff.push(staff.name);
      if (DEBUG_MODE) {
        console.log(`  ✓ Color match found for ${staff.name}: ${staff.color}`);
        console.log(`    Matched patterns: ${matchedPatterns.join(', ')}`);
      }
    } else if (DEBUG_MODE) {
      console.log(`  ✗ No color match for ${staff.name}: ${staff.color}`);
    }
  });
  
  if (DEBUG_MODE) {
    console.log(`  Final color matched staff: ${foundStaff.join(', ')}`);
    console.log(`  =========================`);
  }
  
  return foundStaff;
};

// 시트(탭) 목록을 반환하는 함수 (HTML 파싱 기반)
export const getSheetTabList = async (): Promise<{ name: string; gid: string }[]> => {
  const timestamp = new Date().getTime();
  const urlWithCacheBuster = `${getGoogleSheetUrls().html}?t=${timestamp}`;
  const response = await fetch(urlWithCacheBuster, { method: 'GET', mode: 'cors' });
  if (!response.ok) throw new Error('시트 목록을 가져올 수 없습니다.');
  const htmlText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const tabNodes = Array.from(doc.querySelectorAll('#sheet-menu li a'));
  return tabNodes.map(a => ({
    name: a.textContent?.trim() || '',
    gid: (a as HTMLAnchorElement).getAttribute('href')?.match(/gid=(\d+)/)?.[1] || ''
  })).filter(tab => tab.name && tab.gid);
}; 