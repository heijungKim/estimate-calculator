// ── 단가 기본값 ──────────────────────────────────────────────
var PRICE_VERSION = 4; // index.js와 반드시 동일하게 유지
var DEFAULT_PRICES = {
    sign01_base: 43000, sign01_flex_print: 33000, sign01_flex_sheet: 32000, sign01_tension_none: 22000,
    sign02_base: 33000, sign02_flex_print: 38000, sign02_flex_sheet: 40000, sign02_tension_none: 33000,
    sign03_w800: 70000, sign03_w900: 75000, sign03_w1000: 80000, sign03_w1100: 85000, sign03_w1200: 90000,
    sign03_flex_uv: 8000, sign03_flex_sol: 7000, sign03_flex_sheet: 10000,
    sign_led: 4500, sign_sten_molding: 20000, sign_color_paint_nol: 10000, sign_color_paint_light: 10000, sign_backdrop: 3000,
    angle_w200: 2000, angle_w250: 2500, angle_w300: 3000, angle_w400: 3500, angle_w500: 4000, angle_w600: 4200, angle_w700: 4500,
    angle_w800: 4800, angle_w900: 5000, angle_w1000: 5800, angle_w1100: 5800,
    angle_w1200: 6000, angle_w1300: 6800, angle_w1400: 6800, angle_w1500: 6800,
    angle_w1600: 7000, angle_w1700: 7200, angle_w1800: 7400, angle_w1900: 7600, angle_w2000: 8200,
    ch_taka_eng_30: 25000, ch_taka_eng_40: 28000, ch_taka_eng_50: 34000, ch_taka_eng_60: 40000,
    ch_taka_eng_70: 43000, ch_taka_eng_80: 48000, ch_taka_eng_90: 50000, ch_taka_eng_100: 54000,
    ch_taka_eng_110: 66000, ch_taka_eng_120: 78000, ch_taka_eng_130: 94000, ch_taka_eng_140: 115000, ch_taka_eng_150: 130000, ch_taka_eng_160: 0, ch_taka_eng_170: 0, ch_taka_eng_180: 0,
    ch_taka_kor_30: 25000, ch_taka_kor_40: 28000, ch_taka_kor_50: 34000, ch_taka_kor_60: 40000,
    ch_taka_kor_70: 43000, ch_taka_kor_80: 48000, ch_taka_kor_90: 50000, ch_taka_kor_100: 54000,
    ch_taka_kor_110: 66000, ch_taka_kor_120: 78000, ch_taka_kor_130: 94000, ch_taka_kor_140: 115000, ch_taka_kor_150: 130000, ch_taka_kor_160: 0, ch_taka_kor_170: 0, ch_taka_kor_180: 0,
    ch_taka_got_30: 25000, ch_taka_got_40: 28000, ch_taka_got_50: 34000, ch_taka_got_60: 40000,
    ch_taka_got_70: 43000, ch_taka_got_80: 48000, ch_taka_got_90: 50000, ch_taka_got_100: 54000,
    ch_taka_got_110: 66000, ch_taka_got_120: 78000, ch_taka_got_130: 94000, ch_taka_got_140: 115000, ch_taka_got_150: 130000, ch_taka_got_160: 0, ch_taka_got_170: 0, ch_taka_got_180: 0,
    ch_titan_eng_20: 0, ch_titan_eng_25: 0, ch_titan_eng_30: 0, ch_titan_eng_35: 0, ch_titan_eng_40: 0, ch_titan_eng_45: 0, ch_titan_eng_50: 0, ch_titan_eng_60: 0, ch_titan_eng_70: 0, ch_titan_eng_80: 0, ch_titan_eng_90: 0, ch_titan_eng_100: 0,
    ch_titan_got_20: 0, ch_titan_got_25: 0, ch_titan_got_30: 0, ch_titan_got_35: 0, ch_titan_got_40: 0, ch_titan_got_45: 0, ch_titan_got_50: 0, ch_titan_got_60: 0, ch_titan_got_70: 0, ch_titan_got_80: 0, ch_titan_got_90: 0, ch_titan_got_100: 0,
    ch_sten_eng_20: 0, ch_sten_eng_25: 0, ch_sten_eng_30: 0, ch_sten_eng_35: 0, ch_sten_eng_40: 0, ch_sten_eng_45: 0, ch_sten_eng_50: 0, ch_sten_eng_60: 0, ch_sten_eng_70: 0, ch_sten_eng_80: 0, ch_sten_eng_90: 0, ch_sten_eng_100: 0,
    ch_sten_got_20: 0, ch_sten_got_25: 0, ch_sten_got_30: 0, ch_sten_got_35: 0, ch_sten_got_40: 0, ch_sten_got_45: 0, ch_sten_got_50: 0, ch_sten_got_60: 0, ch_sten_got_70: 0, ch_sten_got_80: 0, ch_sten_got_90: 0, ch_sten_got_100: 0,
    ch_galva_eng_30: 0, ch_galva_eng_35: 0, ch_galva_eng_40: 0, ch_galva_eng_45: 0, ch_galva_eng_50: 0, ch_galva_eng_60: 0, ch_galva_eng_70: 0, ch_galva_eng_80: 0, ch_galva_eng_90: 0, ch_galva_eng_100: 0,
    ch_galva_got_30: 0, ch_galva_got_35: 0, ch_galva_got_40: 0, ch_galva_got_45: 0, ch_galva_got_50: 0, ch_galva_got_60: 0, ch_galva_got_70: 0, ch_galva_got_80: 0, ch_galva_got_90: 0, ch_galva_got_100: 0,
    // 채널문자 크기별 LED 기본 개수 (갈바/스텐/티타늄 - 전광/후광)
    ch_led_jeon_cnt_20: 10, ch_led_jeon_cnt_25: 12, ch_led_jeon_cnt_30: 15, ch_led_jeon_cnt_35: 17, ch_led_jeon_cnt_40: 20, ch_led_jeon_cnt_45: 25, ch_led_jeon_cnt_50: 30, ch_led_jeon_cnt_60: 35, ch_led_jeon_cnt_70: 45, ch_led_jeon_cnt_80: 60, ch_led_jeon_cnt_90: 70, ch_led_jeon_cnt_100: 80,
    ch_led_hu_cnt_20: 10, ch_led_hu_cnt_25: 12, ch_led_hu_cnt_30: 15, ch_led_hu_cnt_35: 17, ch_led_hu_cnt_40: 20, ch_led_hu_cnt_45: 25, ch_led_hu_cnt_50: 30, ch_led_hu_cnt_60: 35, ch_led_hu_cnt_70: 45, ch_led_hu_cnt_80: 60, ch_led_hu_cnt_90: 70, ch_led_hu_cnt_100: 80,
    ch_galva_laser_eng_30: 0, ch_galva_laser_eng_35: 0, ch_galva_laser_eng_40: 0, ch_galva_laser_eng_45: 0, ch_galva_laser_eng_50: 0, ch_galva_laser_eng_60: 0, ch_galva_laser_eng_70: 0, ch_galva_laser_eng_80: 0, ch_galva_laser_eng_90: 0, ch_galva_laser_eng_100: 0,
    ch_galva_laser_got_30: 0, ch_galva_laser_got_35: 0, ch_galva_laser_got_40: 0, ch_galva_laser_got_45: 0, ch_galva_laser_got_50: 0, ch_galva_laser_got_60: 0, ch_galva_laser_got_70: 0, ch_galva_laser_got_80: 0, ch_galva_laser_got_90: 0, ch_galva_laser_got_100: 0,
    ch_gosa_eng_30: 0, ch_gosa_eng_35: 0, ch_gosa_eng_40: 0, ch_gosa_eng_45: 0, ch_gosa_eng_50: 0, ch_gosa_eng_60: 0, ch_gosa_eng_70: 0, ch_gosa_eng_80: 0, ch_gosa_eng_90: 0, ch_gosa_eng_100: 0,
    ch_gosa_got_30: 0, ch_gosa_got_35: 0, ch_gosa_got_40: 0, ch_gosa_got_45: 0, ch_gosa_got_50: 0, ch_gosa_got_60: 0, ch_gosa_got_70: 0, ch_gosa_got_80: 0, ch_gosa_got_90: 0, ch_gosa_got_100: 0,
    ch_sten_laser_eng_20: 0, ch_sten_laser_eng_25: 0, ch_sten_laser_eng_30: 0, ch_sten_laser_eng_35: 0, ch_sten_laser_eng_40: 0, ch_sten_laser_eng_45: 0, ch_sten_laser_eng_50: 0, ch_sten_laser_eng_60: 0, ch_sten_laser_eng_70: 0, ch_sten_laser_eng_80: 0, ch_sten_laser_eng_90: 0, ch_sten_laser_eng_100: 0,
    ch_sten_laser_got_20: 0, ch_sten_laser_got_25: 0, ch_sten_laser_got_30: 0, ch_sten_laser_got_35: 0, ch_sten_laser_got_40: 0, ch_sten_laser_got_45: 0, ch_sten_laser_got_50: 0, ch_sten_laser_got_60: 0, ch_sten_laser_got_70: 0, ch_sten_laser_got_80: 0, ch_sten_laser_got_90: 0, ch_sten_laser_got_100: 0,
    ch_sten_gosa_eng_20: 0, ch_sten_gosa_eng_25: 0, ch_sten_gosa_eng_30: 0, ch_sten_gosa_eng_35: 0, ch_sten_gosa_eng_40: 0, ch_sten_gosa_eng_45: 0, ch_sten_gosa_eng_50: 0, ch_sten_gosa_eng_60: 0, ch_sten_gosa_eng_70: 0, ch_sten_gosa_eng_80: 0, ch_sten_gosa_eng_90: 0, ch_sten_gosa_eng_100: 0,
    ch_sten_gosa_got_20: 0, ch_sten_gosa_got_25: 0, ch_sten_gosa_got_30: 0, ch_sten_gosa_got_35: 0, ch_sten_gosa_got_40: 0, ch_sten_gosa_got_45: 0, ch_sten_gosa_got_50: 0, ch_sten_gosa_got_60: 0, ch_sten_gosa_got_70: 0, ch_sten_gosa_got_80: 0, ch_sten_gosa_got_90: 0, ch_sten_gosa_got_100: 0,
    ch_ilche_eng_20: 0, ch_ilche_eng_25: 0, ch_ilche_eng_30: 0, ch_ilche_eng_35: 0, ch_ilche_eng_40: 0, ch_ilche_eng_45: 0, ch_ilche_eng_50: 0, ch_ilche_eng_55: 0, ch_ilche_eng_60: 0, ch_ilche_eng_65: 0, ch_ilche_eng_70: 0,
    ch_ilche_kor_20: 0, ch_ilche_kor_25: 0, ch_ilche_kor_30: 0, ch_ilche_kor_35: 0, ch_ilche_kor_40: 0, ch_ilche_kor_45: 0, ch_ilche_kor_50: 0, ch_ilche_kor_55: 0, ch_ilche_kor_60: 0, ch_ilche_kor_65: 0, ch_ilche_kor_70: 0,
    ch_ilche_got_20: 0, ch_ilche_got_25: 0, ch_ilche_got_30: 0, ch_ilche_got_35: 0, ch_ilche_got_40: 0, ch_ilche_got_45: 0, ch_ilche_got_50: 0, ch_ilche_got_55: 0, ch_ilche_got_60: 0, ch_ilche_got_65: 0, ch_ilche_got_70: 0,
    ch_epox_eng_20: 0, ch_epox_eng_25: 0, ch_epox_eng_30: 0, ch_epox_eng_35: 0, ch_epox_eng_40: 0, ch_epox_eng_45: 0, ch_epox_eng_50: 0, ch_epox_eng_55: 0, ch_epox_eng_60: 0, ch_epox_eng_65: 0, ch_epox_eng_70: 0,
    ch_epox_kor_20: 0, ch_epox_kor_25: 0, ch_epox_kor_30: 0, ch_epox_kor_35: 0, ch_epox_kor_40: 0, ch_epox_kor_45: 0, ch_epox_kor_50: 0, ch_epox_kor_55: 0, ch_epox_kor_60: 0, ch_epox_kor_65: 0, ch_epox_kor_70: 0,
    ch_epox_got_20: 0, ch_epox_got_25: 0, ch_epox_got_30: 0, ch_epox_got_35: 0, ch_epox_got_40: 0, ch_epox_got_45: 0, ch_epox_got_50: 0, ch_epox_got_55: 0, ch_epox_got_60: 0, ch_epox_got_65: 0, ch_epox_got_70: 0,
    ch_led_white: 450, ch_led_warm: 500, ch_led_rgb: 800, ch_led_panorama: 3500, ch_led_color: 500,
    ch_led_pos_jeon: 0, ch_led_pos_hu: 0, ch_led_pos_jeonhu: 0,
    ch_ggachi_200: 2000, ch_ggachi_250: 2500, ch_ggachi_300: 3000, ch_ggachi_400: 3500,
    ch_complete: 100000,
    ch_trusbar_150: 25000, ch_trusbar_200: 30000, ch_trusbar_250: 40000, ch_trusbar_300: 40000, ch_trusbar_400: 60000,
    flex_uv_double: 8000, flex_uv_single: 8000, flex_sol: 7000, flex_high_bright: 11000, flex_punch: 5000, flex_freq: 8000,
    uv_white: 10000, uv_white_grey: 10000, uv_clear: 10000,
    uv_clear_mirror: 15000, uv_clear_black: 25000,
    uv_punch_pet: 7000, uv_light_white: 13000, uv_embo: 10000,
    uv_pr_white: 10000, uv_pr_white_grey: 10000, uv_pr_clear: 10000,
    uv_pr_clear_mirror: 10000, uv_pr_clear_black: 10000,
    uv_pr_punch_pet: 10000, uv_pr_light_white: 10000, uv_pr_embo: 10000,
    sol_white: 10000, sol_white_grey: 10000, sol_oneway: 13000, sol_light_white: 13000,
    sol_embo: 10000, sol_high_reflect: 40000, sol_banner: 6000, sol_coat: 3000, silsa_cut: 2000,
    sol_pr_white: 0, sol_pr_white_grey: 0, sol_pr_oneway: 0, sol_pr_light_white: 0,
    sol_pr_embo: 0, sol_pr_high_reflect: 0, sol_pr_banner: 0,
    // 공통자재
    cm_floodlight: 0,
    cm_timer_20a: 0, cm_timer_30a: 0, cm_timer_50a: 0,
    cm_smps_60w: 0, cm_smps_100w: 0, cm_smps_150w: 0, cm_smps_200w: 0, cm_smps_300w: 0, cm_smps_400w: 0, cm_smps_500w: 0,
    cm_fluorescent: 0,
    cm_led_ctrl_1ch: 0, cm_led_ctrl_2ch: 0, cm_led_ctrl_3ch: 0,
    cm_led_white: 450, cm_led_warm: 500, cm_led_rgb: 800, cm_led_panorama: 3500, cm_led_color: 500,
    // 스카시 고무 (글자당) n=일반, s=수입금/은색
    skasi_gom_n30_10: 2000, skasi_gom_n30_15: 2500, skasi_gom_n30_20: 3000, skasi_gom_n30_25: 3500, skasi_gom_n30_30: 4000, skasi_gom_n30_35: 5400, skasi_gom_n30_40: 7100, skasi_gom_n30_45: 9000, skasi_gom_n30_50: 11000, skasi_gom_n30_55: 13400, skasi_gom_n30_60: 16000, skasi_gom_n30_65: 18700, skasi_gom_n30_70: 21700, skasi_gom_n30_75: 25000, skasi_gom_n30_80: 28400, skasi_gom_n30_85: 32100, skasi_gom_n30_90: 36000, skasi_gom_n30_95: 40100, skasi_gom_n30_100: 44400, skasi_gom_n30_105: 49000, skasi_gom_n30_110: 53700, skasi_gom_n30_115: 58700, skasi_gom_n30_120: 64000, skasi_gom_n30_125: 69400, skasi_gom_n30_130: 75100, skasi_gom_n30_135: 81000, skasi_gom_n30_140: 87000, skasi_gom_n30_145: 93400, skasi_gom_n30_150: 100000,
    skasi_gom_n50_10: 2500, skasi_gom_n50_15: 3000, skasi_gom_n50_20: 3700, skasi_gom_n50_25: 4500, skasi_gom_n50_30: 5000, skasi_gom_n50_35: 6800, skasi_gom_n50_40: 8800, skasi_gom_n50_45: 11200, skasi_gom_n50_50: 13800, skasi_gom_n50_55: 16800, skasi_gom_n50_60: 20000, skasi_gom_n50_65: 23400, skasi_gom_n50_70: 27200, skasi_gom_n50_75: 31200, skasi_gom_n50_80: 35500, skasi_gom_n50_85: 40100, skasi_gom_n50_90: 45000, skasi_gom_n50_95: 50100, skasi_gom_n50_100: 55500, skasi_gom_n50_105: 61200, skasi_gom_n50_110: 67200, skasi_gom_n50_115: 73400, skasi_gom_n50_120: 80000, skasi_gom_n50_125: 86800, skasi_gom_n50_130: 93800, skasi_gom_n50_135: 101200, skasi_gom_n50_140: 108800, skasi_gom_n50_145: 116800, skasi_gom_n50_150: 125000,
    skasi_gom_s30_10: 3000, skasi_gom_s30_15: 4000, skasi_gom_s30_20: 5000, skasi_gom_s30_25: 6000, skasi_gom_s30_30: 7000, skasi_gom_s30_35: 9500, skasi_gom_s30_40: 12400, skasi_gom_s30_45: 15700, skasi_gom_s30_50: 19400, skasi_gom_s30_55: 23500, skasi_gom_s30_60: 28000, skasi_gom_s30_65: 32800, skasi_gom_s30_70: 38100, skasi_gom_s30_75: 43700, skasi_gom_s30_80: 49700, skasi_gom_s30_85: 56100, skasi_gom_s30_90: 63000, skasi_gom_s30_95: 70100, skasi_gom_s30_100: 77700, skasi_gom_s30_105: 85700, skasi_gom_s30_110: 94100, skasi_gom_s30_115: 102800, skasi_gom_s30_120: 112000, skasi_gom_s30_125: 121500, skasi_gom_s30_130: 131400, skasi_gom_s30_135: 141700, skasi_gom_s30_140: 152400, skasi_gom_s30_145: 163500, skasi_gom_s30_150: 175000,
    skasi_gom_s50_10: 4000, skasi_gom_s50_15: 5000, skasi_gom_s50_20: 6000, skasi_gom_s50_25: 7000, skasi_gom_s50_30: 8000, skasi_gom_s50_35: 10800, skasi_gom_s50_40: 14200, skasi_gom_s50_45: 18000, skasi_gom_s50_50: 22200, skasi_gom_s50_55: 26800, skasi_gom_s50_60: 32000, skasi_gom_s50_65: 37500, skasi_gom_s50_70: 43500, skasi_gom_s50_75: 50000, skasi_gom_s50_80: 56800, skasi_gom_s50_85: 64200, skasi_gom_s50_90: 72000, skasi_gom_s50_95: 80200, skasi_gom_s50_100: 88800, skasi_gom_s50_105: 98000, skasi_gom_s50_110: 107500, skasi_gom_s50_115: 117500, skasi_gom_s50_120: 128000, skasi_gom_s50_125: 138800, skasi_gom_s50_130: 150200, skasi_gom_s50_135: 162000, skasi_gom_s50_140: 174200, skasi_gom_s50_145: 186800, skasi_gom_s50_150: 200000,
    // 스카시 화면 색상 할증
    skasi_gom_color_pct: 50, skasi_acr_color_pct: 50, skasi_acr_docolor: 20000,
    // 스카시 아크릴 (글자당) [3T영문, 3T한글, 5T영문, 5T한글, 8T영문, 8T한글, 10T영문, 10T한글]
    skasi_acr_3t_eng_30: 300, skasi_acr_3t_kor_30: 400, skasi_acr_5t_eng_30: 500, skasi_acr_5t_kor_30: 600, skasi_acr_8t_eng_30: 700, skasi_acr_8t_kor_30: 900, skasi_acr_10t_eng_30: 1100, skasi_acr_10t_kor_30: 1400,
    skasi_acr_3t_eng_40: 400, skasi_acr_3t_kor_40: 500, skasi_acr_5t_eng_40: 600, skasi_acr_5t_kor_40: 700, skasi_acr_8t_eng_40: 900, skasi_acr_8t_kor_40: 1200, skasi_acr_10t_eng_40: 1500, skasi_acr_10t_kor_40: 1900,
    skasi_acr_3t_eng_50: 500, skasi_acr_3t_kor_50: 600, skasi_acr_5t_eng_50: 700, skasi_acr_5t_kor_50: 900, skasi_acr_8t_eng_50: 1100, skasi_acr_8t_kor_50: 1500, skasi_acr_10t_eng_50: 1900, skasi_acr_10t_kor_50: 2600,
    skasi_acr_3t_eng_60: 600, skasi_acr_3t_kor_60: 700, skasi_acr_5t_eng_60: 900, skasi_acr_5t_kor_60: 1000, skasi_acr_8t_eng_60: 1400, skasi_acr_8t_kor_60: 1900, skasi_acr_10t_eng_60: 2100, skasi_acr_10t_kor_60: 3000,
    skasi_acr_3t_eng_70: 700, skasi_acr_3t_kor_70: 900, skasi_acr_5t_eng_70: 1000, skasi_acr_5t_kor_70: 1100, skasi_acr_8t_eng_70: 1800, skasi_acr_8t_kor_70: 2300, skasi_acr_10t_eng_70: 2600, skasi_acr_10t_kor_70: 3400,
    skasi_acr_3t_eng_80: 900, skasi_acr_3t_kor_80: 1000, skasi_acr_5t_eng_80: 1100, skasi_acr_5t_kor_80: 1200, skasi_acr_8t_eng_80: 2000, skasi_acr_8t_kor_80: 2600, skasi_acr_10t_eng_80: 3100, skasi_acr_10t_kor_80: 3800,
    skasi_acr_3t_eng_90: 1000, skasi_acr_3t_kor_90: 1100, skasi_acr_5t_eng_90: 1200, skasi_acr_5t_kor_90: 1500, skasi_acr_8t_eng_90: 2300, skasi_acr_8t_kor_90: 3000, skasi_acr_10t_eng_90: 3400, skasi_acr_10t_kor_90: 4500,
    skasi_acr_3t_eng_100: 1100, skasi_acr_3t_kor_100: 1400, skasi_acr_5t_eng_100: 1500, skasi_acr_5t_kor_100: 1900, skasi_acr_8t_eng_100: 2600, skasi_acr_8t_kor_100: 3300, skasi_acr_10t_eng_100: 3800, skasi_acr_10t_kor_100: 5200,
    skasi_acr_3t_eng_110: 1200, skasi_acr_3t_kor_110: 1500, skasi_acr_5t_eng_110: 1800, skasi_acr_5t_kor_110: 2100, skasi_acr_8t_eng_110: 3000, skasi_acr_8t_kor_110: 3700, skasi_acr_10t_eng_110: 4400, skasi_acr_10t_kor_110: 5700,
    skasi_acr_3t_eng_120: 1500, skasi_acr_3t_kor_120: 1700, skasi_acr_5t_eng_120: 1900, skasi_acr_5t_kor_120: 2500, skasi_acr_8t_eng_120: 3300, skasi_acr_8t_kor_120: 4100, skasi_acr_10t_eng_120: 4900, skasi_acr_10t_kor_120: 6400,
    skasi_acr_3t_eng_130: 1700, skasi_acr_3t_kor_130: 1800, skasi_acr_5t_eng_130: 2100, skasi_acr_5t_kor_130: 2700, skasi_acr_8t_eng_130: 3600, skasi_acr_8t_kor_130: 4600, skasi_acr_10t_eng_130: 5400, skasi_acr_10t_kor_130: 7100,
    skasi_acr_3t_eng_140: 1800, skasi_acr_3t_kor_140: 2000, skasi_acr_5t_eng_140: 2300, skasi_acr_5t_kor_140: 3000, skasi_acr_8t_eng_140: 3900, skasi_acr_8t_kor_140: 5000, skasi_acr_10t_eng_140: 5900, skasi_acr_10t_kor_140: 7700,
    skasi_acr_3t_eng_150: 1900, skasi_acr_3t_kor_150: 2100, skasi_acr_5t_eng_150: 2600, skasi_acr_5t_kor_150: 3200, skasi_acr_8t_eng_150: 4400, skasi_acr_8t_kor_150: 5400, skasi_acr_10t_eng_150: 6400, skasi_acr_10t_kor_150: 8400,
    skasi_acr_3t_eng_160: 2000, skasi_acr_3t_kor_160: 2500, skasi_acr_5t_eng_160: 2700, skasi_acr_5t_kor_160: 3400, skasi_acr_8t_eng_160: 4700, skasi_acr_8t_kor_160: 5900, skasi_acr_10t_eng_160: 7000, skasi_acr_10t_kor_160: 9000,
    skasi_acr_3t_eng_170: 2100, skasi_acr_3t_kor_170: 2600, skasi_acr_5t_eng_170: 3100, skasi_acr_5t_kor_170: 3800, skasi_acr_8t_eng_170: 5200, skasi_acr_8t_kor_170: 6400, skasi_acr_10t_eng_170: 7500, skasi_acr_10t_kor_170: 9700,
    skasi_acr_3t_eng_180: 2300, skasi_acr_3t_kor_180: 2700, skasi_acr_5t_eng_180: 3300, skasi_acr_5t_kor_180: 4100, skasi_acr_8t_eng_180: 5500, skasi_acr_8t_kor_180: 6900, skasi_acr_10t_eng_180: 8100, skasi_acr_10t_kor_180: 10300,
    skasi_acr_3t_eng_190: 2500, skasi_acr_3t_kor_190: 3000, skasi_acr_5t_eng_190: 3700, skasi_acr_5t_kor_190: 4400, skasi_acr_8t_eng_190: 6000, skasi_acr_8t_kor_190: 7300, skasi_acr_10t_eng_190: 8600, skasi_acr_10t_kor_190: 11700,
    skasi_acr_3t_eng_200: 2700, skasi_acr_3t_kor_200: 3200, skasi_acr_5t_eng_200: 3800, skasi_acr_5t_kor_200: 4700, skasi_acr_8t_eng_200: 6400, skasi_acr_8t_kor_200: 8000, skasi_acr_10t_eng_200: 9200, skasi_acr_10t_kor_200: 12300,
    skasi_acr_3t_eng_210: 2900, skasi_acr_3t_kor_210: 3400, skasi_acr_5t_eng_210: 4100, skasi_acr_5t_kor_210: 5000, skasi_acr_8t_eng_210: 7000, skasi_acr_8t_kor_210: 8600, skasi_acr_10t_eng_210: 9900, skasi_acr_10t_kor_210: 12900,
    skasi_acr_3t_eng_220: 3100, skasi_acr_3t_kor_220: 3600, skasi_acr_5t_eng_220: 4400, skasi_acr_5t_kor_220: 5400, skasi_acr_8t_eng_220: 7300, skasi_acr_8t_kor_220: 9000, skasi_acr_10t_eng_220: 10600, skasi_acr_10t_kor_220: 13500,
    skasi_acr_3t_eng_230: 3200, skasi_acr_3t_kor_230: 3800, skasi_acr_5t_eng_230: 4600, skasi_acr_5t_kor_230: 5700, skasi_acr_8t_eng_230: 7900, skasi_acr_8t_kor_230: 9600, skasi_acr_10t_eng_230: 11200, skasi_acr_10t_kor_230: 14200,
    skasi_acr_3t_eng_240: 3300, skasi_acr_3t_kor_240: 4100, skasi_acr_5t_eng_240: 5000, skasi_acr_5t_kor_240: 6000, skasi_acr_8t_eng_240: 8400, skasi_acr_8t_kor_240: 10100, skasi_acr_10t_eng_240: 11800, skasi_acr_10t_kor_240: 14900,
    skasi_acr_3t_eng_250: 3400, skasi_acr_3t_kor_250: 4400, skasi_acr_5t_eng_250: 5300, skasi_acr_5t_kor_250: 6400, skasi_acr_8t_eng_250: 9000, skasi_acr_8t_kor_250: 10800, skasi_acr_10t_eng_250: 12900, skasi_acr_10t_kor_250: 15500,
    skasi_acr_3t_eng_260: 3500, skasi_acr_3t_kor_260: 4600, skasi_acr_5t_eng_260: 5500, skasi_acr_5t_kor_260: 6900, skasi_acr_8t_eng_260: 9500, skasi_acr_8t_kor_260: 11200, skasi_acr_10t_eng_260: 13500, skasi_acr_10t_kor_260: 16300,
    skasi_acr_3t_eng_270: 3700, skasi_acr_3t_kor_270: 4900, skasi_acr_5t_eng_270: 5800, skasi_acr_5t_kor_270: 7200, skasi_acr_8t_eng_270: 9900, skasi_acr_8t_kor_270: 11800, skasi_acr_10t_eng_270: 14200, skasi_acr_10t_kor_270: 17400,
    skasi_acr_3t_eng_280: 3800, skasi_acr_3t_kor_280: 5200, skasi_acr_5t_eng_280: 6000, skasi_acr_5t_kor_280: 7500, skasi_acr_8t_eng_280: 10300, skasi_acr_8t_kor_280: 12400, skasi_acr_10t_eng_280: 14900, skasi_acr_10t_kor_280: 18100,
    skasi_acr_3t_eng_290: 4100, skasi_acr_3t_kor_290: 5400, skasi_acr_5t_eng_290: 6300, skasi_acr_5t_kor_290: 7700, skasi_acr_8t_eng_290: 10800, skasi_acr_8t_kor_290: 12900, skasi_acr_10t_eng_290: 15500, skasi_acr_10t_kor_290: 18800,
    skasi_acr_3t_eng_300: 4500, skasi_acr_3t_kor_300: 5700, skasi_acr_5t_eng_300: 6500, skasi_acr_5t_kor_300: 8000, skasi_acr_8t_eng_300: 11100, skasi_acr_8t_kor_300: 13500, skasi_acr_10t_eng_300: 16100, skasi_acr_10t_kor_300: 19400,
    skasi_acr_3t_eng_310: 4900, skasi_acr_3t_kor_310: 5900, skasi_acr_5t_eng_310: 6900, skasi_acr_5t_kor_310: 8500, skasi_acr_8t_eng_310: 11500, skasi_acr_8t_kor_310: 14200, skasi_acr_10t_eng_310: 16600, skasi_acr_10t_kor_310: 20000,
    skasi_acr_3t_eng_320: 5000, skasi_acr_3t_kor_320: 6300, skasi_acr_5t_eng_320: 7100, skasi_acr_5t_kor_320: 9000, skasi_acr_8t_eng_320: 11800, skasi_acr_8t_kor_320: 14900, skasi_acr_10t_eng_320: 17100, skasi_acr_10t_kor_320: 20700,
    skasi_acr_3t_eng_330: 5100, skasi_acr_3t_kor_330: 6600, skasi_acr_5t_eng_330: 7300, skasi_acr_5t_kor_330: 9600, skasi_acr_8t_eng_330: 12300, skasi_acr_8t_kor_330: 15500, skasi_acr_10t_eng_330: 17600, skasi_acr_10t_kor_330: 22000,
    skasi_acr_3t_eng_340: 5200, skasi_acr_3t_kor_340: 7100, skasi_acr_5t_eng_340: 7600, skasi_acr_5t_kor_340: 10100, skasi_acr_8t_eng_340: 12700, skasi_acr_8t_kor_340: 16200, skasi_acr_10t_eng_340: 18100, skasi_acr_10t_kor_340: 23300,
    skasi_acr_3t_eng_350: 5300, skasi_acr_3t_kor_350: 7500, skasi_acr_5t_eng_350: 7900, skasi_acr_5t_kor_350: 10600, skasi_acr_8t_eng_350: 13000, skasi_acr_8t_kor_350: 16800, skasi_acr_10t_eng_350: 18500, skasi_acr_10t_kor_350: 24600,
    skasi_acr_3t_eng_360: 5400, skasi_acr_3t_kor_360: 7900, skasi_acr_5t_eng_360: 8100, skasi_acr_5t_kor_360: 11100, skasi_acr_8t_eng_360: 13500, skasi_acr_8t_kor_360: 17400, skasi_acr_10t_eng_360: 19400, skasi_acr_10t_kor_360: 25900,
    skasi_acr_3t_eng_370: 5600, skasi_acr_3t_kor_370: 8200, skasi_acr_5t_eng_370: 8400, skasi_acr_5t_kor_370: 11700, skasi_acr_8t_eng_370: 13800, skasi_acr_8t_kor_370: 18100, skasi_acr_10t_eng_370: 20000, skasi_acr_10t_kor_370: 27100,
    skasi_acr_3t_eng_380: 5700, skasi_acr_3t_kor_380: 8600, skasi_acr_5t_eng_380: 8800, skasi_acr_5t_kor_380: 12200, skasi_acr_8t_eng_380: 14200, skasi_acr_8t_kor_380: 18800, skasi_acr_10t_eng_380: 20700, skasi_acr_10t_kor_380: 28500,
    skasi_acr_3t_eng_390: 5800, skasi_acr_3t_kor_390: 9000, skasi_acr_5t_eng_390: 9100, skasi_acr_5t_kor_390: 12700, skasi_acr_8t_eng_390: 14600, skasi_acr_8t_kor_390: 19400, skasi_acr_10t_eng_390: 22000, skasi_acr_10t_kor_390: 29700,
    skasi_acr_3t_eng_400: 5900, skasi_acr_3t_kor_400: 9500, skasi_acr_5t_eng_400: 9600, skasi_acr_5t_kor_400: 13000, skasi_acr_8t_eng_400: 15000, skasi_acr_8t_kor_400: 20000, skasi_acr_10t_eng_400: 22600, skasi_acr_10t_kor_400: 31000
};

var PRICES = JSON.parse(JSON.stringify(DEFAULT_PRICES));
var _previewActive = false;
var _previewPrices = null;
var _previewName   = '';

// ── 헬퍼 ────────────────────────────────────────────────────
function fmtNum(n) {
    return n >= 1000 ? Number(n).toLocaleString('ko-KR') : String(n);
}

function formatCommaInput(el) {
    var oldVal = el.value;
    var selStart = el.selectionStart;
    var digitsBefore = oldVal.slice(0, selStart).replace(/[^0-9]/g, '').length;
    var raw = oldVal.replace(/[^0-9]/g, '');
    if (!raw) { el.value = ''; return; }
    var newVal = Number(raw).toLocaleString('ko-KR');
    el.value = newVal;
    var newPos = newVal.length;
    if (digitsBefore === 0) {
        newPos = 0;
    } else {
        var counted = 0;
        for (var i = 0; i < newVal.length; i++) {
            if (/[0-9]/.test(newVal[i])) counted++;
            if (counted === digitsBefore) { newPos = i + 1; break; }
        }
    }
    el.setSelectionRange(newPos, newPos);
}

// ── Firebase 연동 ─────────────────────────────────────────────
var _pricesDoc = null;
function _initPricesDoc() {
    if (_pricesDoc) return;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _pricesDoc = firebase.firestore().collection('settings').doc('unit_prices');
    } catch(e) {}
}

function savePricesToFirebase(data) {
    _initPricesDoc();
    if (!_pricesDoc) return;
    data._priceVersion = PRICE_VERSION;
    _pricesDoc.set(data).catch(function(){});
}

function _snapshotsCol() {
    _initPricesDoc();
    try { return firebase.firestore().collection('price_snapshots'); } catch(e) { return null; }
}

function savePriceSnapshot(name, prices) {
    var col = _snapshotsCol();
    if (!col) return;
    col.add({ name: name, savedAt: new Date(), prices: prices }).catch(function(){});
}

function loadPriceSnapshots(callback) {
    var col = _snapshotsCol();
    if (!col) { callback([]); return; }
    col.orderBy('savedAt', 'desc').get()
        .then(function(snap) {
            var list = [];
            snap.forEach(function(doc) { list.push({ id: doc.id, data: doc.data() }); });
            callback(list);
        })
        .catch(function() { callback([]); });
}

function deleteSnapshot(id, callback) {
    var col = _snapshotsCol();
    if (!col) return;
    col.doc(id).delete().then(callback).catch(callback);
}

function previewSnapshot(name, prices) {
    clearDiffPreview(false);
    _previewActive = true;
    _previewPrices = prices;
    _previewName   = name;
    var changedCount = 0;
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if (!$el.length) return;
        var newVal = prices[key] !== undefined ? prices[key] : DEFAULT_PRICES[key];
        var oldVal = PRICES[key] !== undefined ? PRICES[key] : DEFAULT_PRICES[key];
        if (newVal !== oldVal) {
            changedCount++;
            $el.addClass('price_diff_input');
            $el.after('<span class="price_diff_badge">' + fmtNum(oldVal) + ' → ' + fmtNum(newVal) + '</span>');
        }
        $el.val(fmtNum(newVal));
    });
    var $banner = $('#price_diff_banner');
    $banner.html(
        '<div class="diff_banner_info">' +
            '<span class="diff_banner_label">미리보기 중</span>' +
            '<span class="diff_banner_name">' + $('<span>').text(name).html() + '</span>' +
            '<span class="diff_banner_count">' + changedCount + '개 항목 변경</span>' +
        '</div>' +
        '<div class="diff_banner_actions">' +
            '<span class="diff_banner_hint">적용하기를 눌러 최종 저장</span>' +
            '<button id="diff_cancel_btn" type="button" class="diff_cancel_btn">취소</button>' +
        '</div>'
    ).show();
    $('#diff_cancel_btn').off('click').on('click', cancelPreview);
    $('html, body').animate({ scrollTop: Math.max(0, ($('#price_diff_banner').offset() || {top:0}).top - 80) }, 250);
}

function clearDiffPreview(revertInputs) {
    if (revertInputs && _previewActive) {
        Object.keys(DEFAULT_PRICES).forEach(function(key) {
            var $el = $("#p_" + key);
            if (!$el.length) return;
            $el.val(fmtNum(PRICES[key] !== undefined ? PRICES[key] : DEFAULT_PRICES[key]));
        });
    }
    $('.price_diff_badge').remove();
    $('.price_diff_input').removeClass('price_diff_input');
    $('#price_diff_banner').hide();
    _previewActive = false;
    _previewPrices = null;
    _previewName   = '';
}

function cancelPreview() { clearDiffPreview(true); }

function _fmtDate(d) {
    if (!d) return '';
    var dt = (d.toDate) ? d.toDate() : new Date(d);
    return dt.getFullYear() + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + String(dt.getDate()).padStart(2,'0') + ' ' + String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0');
}

function renderSnapshotList(list) {
    var $list = $("#price_snapshots_list");
    if (!list.length) {
        $list.html('<div class="price_snapshots_empty">저장된 단가 내역이 없습니다.</div>');
        return;
    }
    var html = '';
    list.forEach(function(item) {
        html += '<div class="price_snapshot_item" data-id="' + item.id + '">';
        html += '<div class="price_snapshot_info"><span class="price_snapshot_name">' + $('<span>').text(item.data.name).html() + '</span><span class="price_snapshot_date">' + _fmtDate(item.data.savedAt) + '</span></div>';
        html += '<div class="price_snapshot_btns"><button class="snap_load_btn" type="button">불러오기</button><button class="snap_del_btn" type="button">삭제</button></div>';
        html += '</div>';
    });
    $list.html(html);
    // 저장된 prices 데이터를 버튼에 연결
    $list.find('.price_snapshot_item').each(function(i) {
        $(this).find('.snap_load_btn').data('prices', list[i].data.prices);
    });
}

function applyPrices() {
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if (!$el.length) return;
        var val = parseFloat(String($el.val()).replace(/,/g, ''));
        if (!isNaN(val) && val >= 0) PRICES[key] = val;
    });
}

function resetPrices() {
    PRICES = JSON.parse(JSON.stringify(DEFAULT_PRICES));
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if ($el.length) $el.val(fmtNum(DEFAULT_PRICES[key]));
    });
}

$(function() {
    // 기본값으로 입력 필드 초기화
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if ($el.length) $el.val(fmtNum(DEFAULT_PRICES[key]));
    });

    // Firebase에 저장된 단가 로드
    _initPricesDoc();
    if (_pricesDoc) {
        _pricesDoc.get()
            .then(function(doc) {
                if (!doc.exists) return;
                var saved = doc.data();
                Object.keys(DEFAULT_PRICES).forEach(function(key) {
                    if (saved[key] !== undefined) {
                        PRICES[key] = saved[key];
                        var $el = $("#p_" + key);
                        if ($el.length) $el.val(fmtNum(saved[key]));
                    }
                });
            })
            .catch(function(){});
    }

    // 입력 콤마 포맷
    $(document).on('input', '.price_panel_body input[type="text"]', function() {
        formatCommaInput(this);
    });

    // 자동 1.3배: 영문 → 한글 (알루미늄/일체형/에폭시)
    $(document).on('input', '[id^="p_ch_taka_eng_"],[id^="p_ch_ilche_eng_"],[id^="p_ch_epox_eng_"]', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var val = parseInt(raw) || 0;
        var korEl = document.getElementById(this.id.replace('_eng_', '_kor_'));
        if (korEl) korEl.value = val > 0 ? Math.round(val * 1.3).toLocaleString('ko-KR') : '';
    });

    // 자동 1.3배: 한글 → 흘림체 (알루미늄/일체형/에폭시)
    $(document).on('input', '[id^="p_ch_taka_kor_"],[id^="p_ch_ilche_kor_"],[id^="p_ch_epox_kor_"]', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var val = parseInt(raw) || 0;
        var gotEl = document.getElementById(this.id.replace('_kor_', '_got_'));
        if (gotEl) gotEl.value = val > 0 ? Math.round(val * 1.3).toLocaleString('ko-KR') : '';
    });

    // 자동 1.3배: 영문/한글 → 흘림체 (티타늄/스텐/갈바/갈바오사이)
    $(document).on('input', '[id^="p_ch_titan_eng_"],[id^="p_ch_sten_eng_"],[id^="p_ch_galva_eng_"],[id^="p_ch_gosa_eng_"]', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var val = parseInt(raw) || 0;
        var gotEl = document.getElementById(this.id.replace('_eng_', '_got_'));
        if (gotEl) gotEl.value = val > 0 ? Math.round(val * 1.3).toLocaleString('ko-KR') : '';
    });

    // 적용하기
    $("#btn_apply_prices").click(function() {
        if (_previewActive) {
            // 미리보기 중: 바로 적용 (입력값 기준)
            applyPrices();
            savePricesToFirebase(PRICES);
            clearDiffPreview(false);
            var $b = $(this);
            $b.text("✓ 적용됨").addClass("applied");
            setTimeout(function() { $b.text("적용하기").removeClass("applied"); }, 1500);
        } else {
            // 일반 저장: 이름 팝업
            $("#price_save_name").val('');
            $("#price_save_modal").fadeIn(150);
            setTimeout(function(){ $("#price_save_name").focus(); }, 160);
        }
    });

    $("#price_save_cancel").click(function() {
        $("#price_save_modal").fadeOut(150);
    });
    $("#price_save_modal").click(function(e) {
        if ($(e.target).is('.price_modal_overlay')) $("#price_save_modal").fadeOut(150);
    });

    $("#price_save_confirm").click(function() {
        var name = $.trim($("#price_save_name").val());
        if (!name) { $("#price_save_name").focus(); return; }
        applyPrices();
        savePricesToFirebase(PRICES);
        savePriceSnapshot(name, JSON.parse(JSON.stringify(PRICES)));
        $("#price_save_modal").fadeOut(150);
        var $btn = $("#btn_apply_prices");
        $btn.text("✓ 적용됨").addClass("applied");
        setTimeout(function() { $btn.text("적용하기").removeClass("applied"); }, 1500);
    });
    $("#price_save_name").keydown(function(e) {
        if (e.key === 'Enter') $("#price_save_confirm").click();
        if (e.key === 'Escape') $("#price_save_cancel").click();
    });

    // 불러오기
    $("#btn_load_prices").click(function() {
        $("#price_snapshots_list").html('<div class="price_snapshots_empty">불러오는 중...</div>');
        $("#price_load_modal").fadeIn(150);
        loadPriceSnapshots(function(list) { renderSnapshotList(list); });
    });

    $("#price_load_close").click(function() {
        $("#price_load_modal").fadeOut(150);
    });
    $("#price_load_modal").click(function(e) {
        if ($(e.target).is('.price_modal_overlay')) $("#price_load_modal").fadeOut(150);
    });

    $(document).on('click', '.snap_load_btn', function() {
        var prices = $(this).data('prices');
        var name   = $(this).closest('.price_snapshot_item').find('.price_snapshot_name').text();
        if (!prices) return;
        $("#price_load_modal").fadeOut(150);
        setTimeout(function() { previewSnapshot(name, prices); }, 180);
    });

    $(document).on('click', '.snap_del_btn', function() {
        var $item = $(this).closest('.price_snapshot_item');
        var id = $item.data('id');
        if (!confirm('이 단가를 삭제하시겠습니까?')) return;
        $item.css('opacity', 0.4);
        deleteSnapshot(id, function() {
            loadPriceSnapshots(function(list) { renderSnapshotList(list); });
        });
    });

    // 섹션별 초기화
    $(document).on('click', '.price_section_reset_btn', function() {
        if (_previewActive) clearDiffPreview(true); // 미리보기 취소 후 초기화
        var $section = $(this).closest('.price_section');
        $section.find('input').each(function() {
            var key = $(this).attr('id').replace(/^p_/, '');
            if (DEFAULT_PRICES.hasOwnProperty(key)) {
                $(this).val(fmtNum(DEFAULT_PRICES[key]));
                PRICES[key] = DEFAULT_PRICES[key];
            }
        });
        savePricesToFirebase(PRICES);
    });
});
