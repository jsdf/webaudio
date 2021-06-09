#include "GenTemplate.h"

namespace GenTemplate {

/*******************************************************************************************************************
Cycling '74 License for Max-Generated Code for Export
Copyright (c) 2016 Cycling '74
The code that Max generates automatically and that end users are capable of exporting and using, and any
  associated documentation files (the “Software”) is a work of authorship for which Cycling '74 is the author
  and owner for copyright purposes.  A license is hereby granted, free of charge, to any person obtaining a
  copy of the Software (“Licensee”) to use, copy, modify, merge, publish, and distribute copies of the Software,
  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The Software is licensed to Licensee only for non-commercial use. Users who wish to make commercial use of the
  Software must contact the copyright owner to determine if a license for commercial use is available, and the
  terms and conditions for same, which may include fees or royalties. For commercial use, please send inquiries
  to licensing (at) cycling74.com.  The determination of whether a use is commercial use or non-commercial use is based
  upon the use, not the user. The Software may be used by individuals, institutions, governments, corporations, or
  other business whether for-profit or non-profit so long as the use itself is not a commercialization of the
  materials or a use that generates or is intended to generate income, revenue, sales or profit.
The above copyright notice and this license shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
  CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
  DEALINGS IN THE SOFTWARE.
*******************************************************************************************************************/

// global noise generator
Noise noise;
static const int GENLIB_LOOPCOUNT_BAIL = 100000;


// The State struct contains all the state and procedures for the gendsp kernel
typedef struct State {
	CommonState __commonstate;
	DCBlock __m_dcblock_20;
	DCBlock __m_dcblock_17;
	int __exception;
	int vectorsize;
	t_sample m_fT_12;
	t_sample m_history_11;
	t_sample m_A_1;
	t_sample m_history_13;
	t_sample m_history_15;
	t_sample m_history_14;
	t_sample m_history_16;
	t_sample m_history_10;
	t_sample m_history_9;
	t_sample m_fT_7;
	t_sample m_C_3;
	t_sample m_D_2;
	t_sample samplerate;
	t_sample m_Push_4;
	t_sample m_B_6;
	t_sample m_Exp_5;
	t_sample m_history_8;
	// re-initialize all member variables;
	inline void reset(t_param __sr, int __vs) {
		__exception = 0;
		vectorsize = __vs;
		samplerate = __sr;
		m_A_1 = ((int)0);
		m_D_2 = ((int)0);
		m_C_3 = ((int)0);
		m_Push_4 = ((int)0);
		m_Exp_5 = ((int)0);
		m_B_6 = ((int)0);
		m_fT_7 = ((int)0);
		m_history_8 = ((int)0);
		m_history_9 = ((int)0);
		m_history_10 = ((int)0);
		m_history_11 = ((int)0);
		m_fT_12 = ((int)0);
		m_history_13 = ((int)0);
		m_history_14 = ((int)0);
		m_history_15 = ((int)0);
		m_history_16 = ((int)0);
		__m_dcblock_17.reset();
		__m_dcblock_20.reset();
		genlib_reset_complete(this);
		
	};
	// the signal processing routine;
	inline int perform(t_sample ** __ins, t_sample ** __outs, int __n) {
		vectorsize = __n;
		const t_sample * __in1 = __ins[0];
		const t_sample * __in2 = __ins[1];
		t_sample * __out1 = __outs[0];
		t_sample * __out2 = __outs[1];
		if (__exception) {
			return __exception;
			
		} else if (( (__in1 == 0) || (__in2 == 0) || (__out1 == 0) || (__out2 == 0) )) {
			__exception = GENLIB_ERR_NULL_BUFFER;
			return __exception;
			
		};
		t_sample expr_280 = log10((m_A_1 * ((t_sample)0.00022675736961451)));
		t_sample mul_277 = (m_C_3 * ((int)1000));
		t_sample add_2 = (expr_280 + ((int)0));
		t_sample gen_3 = add_2;
		t_sample mul_6 = (m_B_6 * ((int)4));
		t_sample add_4 = (mul_6 + ((int)0));
		t_sample gen_5 = add_4;
		t_sample nk_178 = gen_5;
		t_sample nk_106 = nk_178;
		t_sample expr_261 = (gen_3 * safediv(((t_sample)3.1415926535898), samplerate));
		t_sample x2 = (expr_261 * expr_261);
		t_sample x3 = (x2 * expr_261);
		t_sample x5 = (x2 * x3);
		t_sample expr_260 = (((x5 * ((t_sample)0.133333)) + (x3 * ((t_sample)0.333333))) + expr_261);
		t_sample gen_262 = expr_260;
		t_sample pass_188 = gen_262;
		t_sample pass_242 = gen_262;
		t_sample pass_224 = gen_262;
		t_sample pass_206 = gen_262;
		t_sample add_196 = (pass_188 + ((int)1));
		t_sample rdiv_195 = safediv(((int)1), add_196);
		t_sample nk_102 = nk_178;
		t_sample add_247 = (pass_242 + ((int)1));
		t_sample rdiv_246 = safediv(((int)1), add_247);
		t_sample add_232 = (pass_224 + ((int)1));
		t_sample rdiv_231 = safediv(((int)1), add_232);
		t_sample add_214 = (pass_206 + ((int)1));
		t_sample rdiv_213 = safediv(((int)1), add_214);
		t_sample nk_107 = nk_178;
		t_sample nk_93 = nk_178;
		t_sample nk_97 = nk_178;
		t_sample nk_112 = nk_178;
		t_sample mul_244 = (rdiv_246 * pass_242);
		t_sample mul_229 = (pass_224 * mul_244);
		t_sample mul_228 = (rdiv_231 * mul_229);
		t_sample mul_211 = (pass_206 * mul_228);
		t_sample mul_210 = (rdiv_213 * mul_211);
		t_sample mul_193 = (pass_188 * mul_210);
		t_sample mul_192 = (rdiv_195 * mul_193);
		t_sample ng_109 = mul_192;
		t_sample mul_134 = (nk_107 * ng_109);
		t_sample ng_104 = ng_109;
		t_sample mul_122 = (nk_102 * ng_104);
		t_sample ng_95 = ng_109;
		t_sample mul_146 = (nk_93 * ng_95);
		t_sample ng_99 = ng_109;
		t_sample mul_158 = (nk_97 * ng_99);
		t_sample ng_114 = ng_109;
		t_sample mul_170 = (nk_112 * ng_114);
		t_sample add_476 = (expr_280 + ((int)0));
		t_sample gen_307 = add_476;
		t_sample mul_364 = (m_B_6 * ((int)4));
		t_sample add_329 = (mul_364 + ((int)0));
		t_sample gen_319 = add_329;
		t_sample nk_411 = gen_319;
		t_sample nk_298 = nk_411;
		t_sample expr_327 = (gen_307 * safediv(((t_sample)3.1415926535898), samplerate));
		t_sample x_470 = (expr_327 * expr_327);
		t_sample x_441 = (x_470 * expr_327);
		t_sample x_288 = (x_470 * x_441);
		t_sample expr_452 = (((x_288 * ((t_sample)0.133333)) + (x_441 * ((t_sample)0.333333))) + expr_327);
		t_sample gen_432 = expr_452;
		t_sample pass_454 = gen_432;
		t_sample pass_492 = gen_432;
		t_sample pass_340 = gen_432;
		t_sample pass_424 = gen_432;
		t_sample add_473 = (pass_454 + ((int)1));
		t_sample rdiv_363 = safediv(((int)1), add_473);
		t_sample nk_458 = nk_411;
		t_sample add_423 = (pass_492 + ((int)1));
		t_sample rdiv_478 = safediv(((int)1), add_423);
		t_sample add_367 = (pass_340 + ((int)1));
		t_sample rdiv_485 = safediv(((int)1), add_367);
		t_sample add_425 = (pass_424 + ((int)1));
		t_sample rdiv_461 = safediv(((int)1), add_425);
		t_sample nk_305 = nk_411;
		t_sample nk_415 = nk_411;
		t_sample nk_419 = nk_411;
		t_sample nk_294 = nk_411;
		t_sample mul_413 = (rdiv_478 * pass_492);
		t_sample mul_310 = (pass_340 * mul_413);
		t_sample mul_324 = (rdiv_485 * mul_310);
		t_sample mul_369 = (pass_424 * mul_324);
		t_sample mul_457 = (rdiv_461 * mul_369);
		t_sample mul_381 = (pass_454 * mul_457);
		t_sample mul_494 = (rdiv_363 * mul_381);
		t_sample ng_303 = mul_494;
		t_sample mul_483 = (nk_305 * ng_303);
		t_sample ng_406 = ng_303;
		t_sample mul_420 = (nk_458 * ng_406);
		t_sample ng_486 = ng_303;
		t_sample mul_375 = (nk_415 * ng_486);
		t_sample ng_379 = ng_303;
		t_sample mul_422 = (nk_419 * ng_379);
		t_sample ng_354 = ng_303;
		t_sample mul_395 = (nk_294 * ng_354);
		// the main sample loop;
		while ((__n--)) {
			const t_sample in1 = (*(__in1++));
			const t_sample in2 = (*(__in2++));
			t_sample nx_116 = in1;
			t_sample nx_101 = nx_116;
			t_sample add_199 = (m_history_11 + m_history_11);
			t_sample add_250 = (m_history_8 + m_history_8);
			t_sample add_235 = (m_history_9 + m_history_9);
			t_sample add_217 = (m_history_10 + m_history_10);
			t_sample nx_105 = nx_116;
			t_sample nx_110 = nx_116;
			t_sample nx_177 = nx_116;
			t_sample div_179 = safediv(nx_177, nk_178);
			t_sample nx_96 = nx_116;
			t_sample nx_100 = nx_116;
			t_sample mul_243 = (rdiv_246 * add_250);
			t_sample mul_227 = (pass_224 * mul_243);
			t_sample add_226 = (mul_227 + add_235);
			t_sample mul_225 = (rdiv_231 * add_226);
			t_sample mul_209 = (pass_206 * mul_225);
			t_sample add_208 = (mul_209 + add_217);
			t_sample mul_207 = (rdiv_213 * add_208);
			t_sample mul_191 = (pass_188 * mul_207);
			t_sample add_190 = (mul_191 + add_199);
			t_sample mul_189 = (rdiv_195 * add_190);
			t_sample ns_98 = mul_189;
			t_sample ns_103 = ns_98;
			t_sample ns_108 = ns_98;
			t_sample ns_94 = ns_98;
			t_sample ns_113 = ns_98;
			t_sample add_186 = (mul_189 + mul_192);
			t_sample mul_184 = (add_186 * nk_178);
			int gte_183 = (nx_177 >= mul_184);
			t_sample sub_187 = (mul_189 - mul_192);
			t_sample mul_185 = (sub_187 * nk_178);
			int lte_182 = (nx_177 <= mul_185);
			t_sample switch_180 = (lte_182 ? sub_187 : div_179);
			t_sample switch_181 = (gte_183 ? add_186 : switch_180);
			t_sample pass_115 = switch_181;
			t_sample mul_176 = (nk_112 * pass_115);
			t_sample sub_175 = (nx_116 - mul_176);
			t_sample expr_90 = tnhA_d(sub_175);
			t_sample gen_91 = expr_90;
			t_sample mul_174 = (gen_91 * ng_114);
			t_sample add_173 = (mul_174 + ns_113);
			t_sample sub_172 = (add_173 - pass_115);
			t_sample mul_169 = (gen_91 * gen_91);
			t_sample sub_168 = (mul_169 - ((int)1));
			t_sample mul_167 = (mul_170 * sub_168);
			t_sample sub_166 = (mul_167 - ((int)1));
			t_sample div_171 = safediv(sub_172, sub_166);
			t_sample sub_165 = (pass_115 - div_171);
			t_sample mul_164 = (nk_97 * sub_165);
			t_sample sub_163 = (nx_100 - mul_164);
			t_sample expr_75 = tnhA_264_d(sub_163);
			t_sample gen_76 = expr_75;
			t_sample mul_162 = (gen_76 * ng_99);
			t_sample add_161 = (mul_162 + ns_98);
			t_sample sub_160 = (add_161 - sub_165);
			t_sample mul_157 = (gen_76 * gen_76);
			t_sample sub_156 = (mul_157 - ((int)1));
			t_sample mul_155 = (mul_158 * sub_156);
			t_sample sub_154 = (mul_155 - ((int)1));
			t_sample div_159 = safediv(sub_160, sub_154);
			t_sample sub_153 = (sub_165 - div_159);
			t_sample mul_152 = (nk_93 * sub_153);
			t_sample sub_151 = (nx_96 - mul_152);
			t_sample expr_62 = tnhA_265_d(sub_151);
			t_sample gen_63 = expr_62;
			t_sample mul_150 = (gen_63 * ng_95);
			t_sample add_149 = (mul_150 + ns_94);
			t_sample sub_148 = (add_149 - sub_153);
			t_sample mul_145 = (gen_63 * gen_63);
			t_sample sub_144 = (mul_145 - ((int)1));
			t_sample mul_143 = (mul_146 * sub_144);
			t_sample sub_142 = (mul_143 - ((int)1));
			t_sample div_147 = safediv(sub_148, sub_142);
			t_sample sub_141 = (sub_153 - div_147);
			t_sample pass_111 = sub_141;
			t_sample mul_140 = (nk_107 * pass_111);
			t_sample sub_139 = (nx_110 - mul_140);
			t_sample expr_49 = tnhA_266_d(sub_139);
			t_sample gen_50 = expr_49;
			t_sample mul_138 = (gen_50 * ng_109);
			t_sample add_137 = (mul_138 + ns_108);
			t_sample sub_136 = (add_137 - pass_111);
			t_sample mul_133 = (gen_50 * gen_50);
			t_sample sub_132 = (mul_133 - ((int)1));
			t_sample mul_131 = (mul_134 * sub_132);
			t_sample sub_130 = (mul_131 - ((int)1));
			t_sample div_135 = safediv(sub_136, sub_130);
			t_sample sub_129 = (pass_111 - div_135);
			t_sample mul_128 = (nk_102 * sub_129);
			t_sample sub_127 = (nx_105 - mul_128);
			t_sample expr_36 = tnhA_267_d(sub_127);
			t_sample gen_37 = expr_36;
			t_sample mul_126 = (gen_37 * ng_104);
			t_sample add_125 = (mul_126 + ns_103);
			t_sample sub_124 = (add_125 - sub_129);
			t_sample mul_121 = (gen_37 * gen_37);
			t_sample sub_120 = (mul_121 - ((int)1));
			t_sample mul_119 = (mul_122 * sub_120);
			t_sample sub_118 = (mul_119 - ((int)1));
			t_sample div_123 = safediv(sub_124, sub_118);
			t_sample sub_117 = (sub_129 - div_123);
			t_sample expr_263 = (nx_101 - (nk_106 * sub_117));
			t_sample mul_16 = (((t_sample)0.999) * m_fT_7);
			t_sample add_17 = (mul_16 + ((t_sample)0.001028652));
			t_sample gen_20 = add_17;
			t_sample fT_next_19 = fixdenorm(add_17);
			t_sample rdiv_9 = safediv(((int)1), gen_20);
			t_sample dcblock_21 = __m_dcblock_17(expr_263);
			t_sample mul_13 = (dcblock_21 * rdiv_9);
			t_sample expr_11 = tanhLambert_d(mul_13);
			t_sample gen_12 = expr_11;
			t_sample mul_14 = (gen_12 * gen_20);
			t_sample gen_24 = mul_14;
			t_sample pass_256 = gen_24;
			t_sample mul_249 = (pass_256 * pass_242);
			t_sample add_248 = (mul_249 + add_250);
			t_sample mul_245 = (add_248 * rdiv_246);
			t_sample sub_255 = (pass_256 - mul_245);
			t_sample mul_254 = (sub_255 * pass_242);
			t_sample add_253 = (mul_254 + m_history_8);
			t_sample add_251 = (add_253 + m_history_8);
			t_sample pass_241 = add_251;
			t_sample mul_234 = (pass_241 * pass_224);
			t_sample add_233 = (mul_234 + add_235);
			t_sample mul_230 = (add_233 * rdiv_231);
			t_sample sub_240 = (pass_241 - mul_230);
			t_sample mul_239 = (sub_240 * pass_224);
			t_sample add_238 = (mul_239 + m_history_9);
			t_sample add_236 = (add_238 + m_history_9);
			t_sample pass_223 = add_236;
			t_sample mul_216 = (pass_223 * pass_206);
			t_sample add_215 = (mul_216 + add_217);
			t_sample mul_212 = (add_215 * rdiv_213);
			t_sample sub_222 = (pass_223 - mul_212);
			t_sample mul_221 = (sub_222 * pass_206);
			t_sample add_220 = (mul_221 + m_history_10);
			t_sample add_218 = (add_220 + m_history_10);
			t_sample pass_205 = add_218;
			t_sample mul_198 = (pass_205 * pass_188);
			t_sample add_197 = (mul_198 + add_199);
			t_sample mul_194 = (add_197 * rdiv_195);
			t_sample sub_204 = (pass_205 - mul_194);
			t_sample mul_203 = (sub_204 * pass_188);
			t_sample add_202 = (mul_203 + m_history_11);
			t_sample history_252_next_268 = fixdenorm(add_253);
			t_sample history_237_next_269 = fixdenorm(add_238);
			t_sample history_219_next_270 = fixdenorm(add_220);
			t_sample history_201_next_271 = fixdenorm(add_202);
			t_sample mul_1 = (sub_117 * mul_277);
			t_sample tanh_273 = tanh(mul_1);
			t_sample mul_275 = (tanh_273 * m_D_2);
			t_sample out1 = mul_275;
			t_sample nx_297 = in2;
			t_sample nx_338 = nx_297;
			t_sample add_403 = (m_history_16 + m_history_16);
			t_sample add_290 = (m_history_13 + m_history_13);
			t_sample add_291 = (m_history_14 + m_history_14);
			t_sample add_418 = (m_history_15 + m_history_15);
			t_sample nx_414 = nx_297;
			t_sample nx_330 = nx_297;
			t_sample nx_480 = nx_297;
			t_sample div_313 = safediv(nx_480, nk_411);
			t_sample nx_459 = nx_297;
			t_sample nx_389 = nx_297;
			t_sample mul_463 = (rdiv_478 * add_290);
			t_sample mul_321 = (pass_340 * mul_463);
			t_sample add_289 = (mul_321 + add_291);
			t_sample mul_384 = (rdiv_485 * add_289);
			t_sample mul_334 = (pass_424 * mul_384);
			t_sample add_296 = (mul_334 + add_418);
			t_sample mul_370 = (rdiv_461 * add_296);
			t_sample mul_299 = (pass_454 * mul_370);
			t_sample add_300 = (mul_299 + add_403);
			t_sample mul_417 = (rdiv_363 * add_300);
			t_sample ns_317 = mul_417;
			t_sample ns_497 = ns_317;
			t_sample ns_493 = ns_317;
			t_sample ns_475 = ns_317;
			t_sample ns_292 = ns_317;
			t_sample add_465 = (mul_417 + mul_494);
			t_sample mul_306 = (add_465 * nk_411);
			int gte_410 = (nx_480 >= mul_306);
			t_sample sub_316 = (mul_417 - mul_494);
			t_sample mul_467 = (sub_316 * nk_411);
			int lte_335 = (nx_480 <= mul_467);
			t_sample switch_302 = (lte_335 ? sub_316 : div_313);
			t_sample switch_345 = (gte_410 ? add_465 : switch_302);
			t_sample pass_361 = switch_345;
			t_sample mul_428 = (nk_294 * pass_361);
			t_sample sub_456 = (nx_297 - mul_428);
			t_sample expr_484 = tnhA_283_d(sub_456);
			t_sample gen_312 = expr_484;
			t_sample mul_409 = (gen_312 * ng_354);
			t_sample add_385 = (mul_409 + ns_292);
			t_sample sub_371 = (add_385 - pass_361);
			t_sample mul_318 = (gen_312 * gen_312);
			t_sample sub_430 = (mul_318 - ((int)1));
			t_sample mul_355 = (mul_395 * sub_430);
			t_sample sub_474 = (mul_355 - ((int)1));
			t_sample div_287 = safediv(sub_371, sub_474);
			t_sample sub_341 = (pass_361 - div_287);
			t_sample mul_378 = (nk_419 * sub_341);
			t_sample sub_460 = (nx_389 - mul_378);
			t_sample expr_416 = tnhA_285_d(sub_460);
			t_sample gen_487 = expr_416;
			t_sample mul_462 = (gen_487 * ng_379);
			t_sample add_372 = (mul_462 + ns_317);
			t_sample sub_421 = (add_372 - sub_341);
			t_sample mul_388 = (gen_487 * gen_487);
			t_sample sub_386 = (mul_388 - ((int)1));
			t_sample mul_482 = (mul_422 * sub_386);
			t_sample sub_373 = (mul_482 - ((int)1));
			t_sample div_479 = safediv(sub_421, sub_373);
			t_sample sub_448 = (sub_341 - div_479);
			t_sample mul_326 = (nk_415 * sub_448);
			t_sample sub_477 = (nx_459 - mul_326);
			t_sample expr_309 = tnhA_286_d(sub_477);
			t_sample gen_472 = expr_309;
			t_sample mul_322 = (gen_472 * ng_486);
			t_sample add_471 = (mul_322 + ns_475);
			t_sample sub_469 = (add_471 - sub_448);
			t_sample mul_393 = (gen_472 * gen_472);
			t_sample sub_333 = (mul_393 - ((int)1));
			t_sample mul_439 = (mul_375 * sub_333);
			t_sample sub_314 = (mul_439 - ((int)1));
			t_sample div_453 = safediv(sub_469, sub_314);
			t_sample sub_382 = (sub_448 - div_453);
			t_sample pass_496 = sub_382;
			t_sample mul_368 = (nk_305 * pass_496);
			t_sample sub_293 = (nx_330 - mul_368);
			t_sample expr_408 = tnhA_284_d(sub_293);
			t_sample gen_301 = expr_408;
			t_sample mul_468 = (gen_301 * ng_303);
			t_sample add_366 = (mul_468 + ns_493);
			t_sample sub_446 = (add_366 - pass_496);
			t_sample mul_450 = (gen_301 * gen_301);
			t_sample sub_304 = (mul_450 - ((int)1));
			t_sample mul_311 = (mul_483 * sub_304);
			t_sample sub_392 = (mul_311 - ((int)1));
			t_sample div_374 = safediv(sub_446, sub_392);
			t_sample sub_444 = (pass_496 - div_374);
			t_sample mul_376 = (nk_458 * sub_444);
			t_sample sub_295 = (nx_414 - mul_376);
			t_sample expr_442 = tnhA_281_d(sub_295);
			t_sample gen_440 = expr_442;
			t_sample mul_377 = (gen_440 * ng_406);
			t_sample add_437 = (mul_377 + ns_497);
			t_sample sub_436 = (add_437 - sub_444);
			t_sample mul_308 = (gen_440 * gen_440);
			t_sample sub_390 = (mul_308 - ((int)1));
			t_sample mul_397 = (mul_420 * sub_390);
			t_sample sub_346 = (mul_397 - ((int)1));
			t_sample div_435 = safediv(sub_436, sub_346);
			t_sample sub_401 = (sub_444 - div_435);
			t_sample expr_337 = (nx_338 - (nk_298 * sub_401));
			t_sample mul_315 = (((t_sample)0.999) * m_fT_12);
			t_sample add_360 = (mul_315 + ((t_sample)0.001028652));
			t_sample gen_431 = add_360;
			t_sample fT_next_412 = fixdenorm(add_360);
			t_sample rdiv_449 = safediv(((int)1), gen_431);
			t_sample dcblock_407 = __m_dcblock_20(expr_337);
			t_sample mul_488 = (dcblock_407 * rdiv_449);
			t_sample expr_405 = tanhLambert_282_d(mul_488);
			t_sample gen_342 = expr_405;
			t_sample mul_400 = (gen_342 * gen_431);
			t_sample gen_399 = mul_400;
			t_sample pass_398 = gen_399;
			t_sample mul_396 = (pass_398 * pass_492);
			t_sample add_438 = (mul_396 + add_290);
			t_sample mul_391 = (add_438 * rdiv_478);
			t_sample sub_387 = (pass_398 - mul_391);
			t_sample mul_359 = (sub_387 * pass_492);
			t_sample add_455 = (mul_359 + m_history_13);
			t_sample add_380 = (add_455 + m_history_13);
			t_sample pass_394 = add_380;
			t_sample mul_443 = (pass_394 * pass_340);
			t_sample add_490 = (mul_443 + add_291);
			t_sample mul_323 = (add_490 * rdiv_485);
			t_sample sub_445 = (pass_394 - mul_323);
			t_sample mul_447 = (sub_445 * pass_340);
			t_sample add_365 = (mul_447 + m_history_14);
			t_sample add_491 = (add_365 + m_history_14);
			t_sample pass_362 = add_491;
			t_sample mul_466 = (pass_362 * pass_424);
			t_sample add_336 = (mul_466 + add_418);
			t_sample mul_426 = (add_336 * rdiv_461);
			t_sample sub_383 = (pass_362 - mul_426);
			t_sample mul_358 = (sub_383 * pass_424);
			t_sample add_357 = (mul_358 + m_history_15);
			t_sample add_356 = (add_357 + m_history_15);
			t_sample pass_353 = add_356;
			t_sample mul_352 = (pass_353 * pass_454);
			t_sample add_351 = (mul_352 + add_403);
			t_sample mul_350 = (add_351 * rdiv_363);
			t_sample sub_349 = (pass_353 - mul_350);
			t_sample mul_348 = (sub_349 * pass_454);
			t_sample add_347 = (mul_348 + m_history_16);
			t_sample history_252_next_404 = fixdenorm(add_455);
			t_sample history_237_next_328 = fixdenorm(add_365);
			t_sample history_219_next_489 = fixdenorm(add_357);
			t_sample history_201_next_339 = fixdenorm(add_347);
			t_sample mul_332 = (sub_401 * mul_277);
			t_sample tanh_331 = tanh(mul_332);
			t_sample mul_276 = (tanh_331 * m_D_2);
			t_sample out2 = mul_276;
			m_fT_7 = fT_next_19;
			m_history_16 = history_201_next_339;
			m_history_15 = history_219_next_489;
			m_history_14 = history_237_next_328;
			m_history_13 = history_252_next_404;
			m_fT_12 = fT_next_412;
			m_history_11 = history_201_next_271;
			m_history_10 = history_219_next_270;
			m_history_9 = history_237_next_269;
			m_history_8 = history_252_next_268;
			// assign results to output buffer;
			(*(__out1++)) = out1;
			(*(__out2++)) = out2;
			
		};
		return __exception;
		
	};
	inline void set_A(t_param _value) {
		m_A_1 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_D(t_param _value) {
		m_D_2 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_C(t_param _value) {
		m_C_3 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_Push(t_param _value) {
		m_Push_4 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_Exp(t_param _value) {
		m_Exp_5 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_B(t_param _value) {
		m_B_6 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline t_sample tnhA_d(t_sample x) {
		x = (x * ((int)2));
		t_sample x_84 = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_85 = (x_84 * x_84);
		t_sample x_86 = (x_85 * x_85);
		t_sample x_87 = (x_86 * x_86);
		t_sample x_88 = (x_87 * x_87);
		t_sample x_89 = (x_88 * x_88);
		return ((safediv((-((int)1)), (x_89 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_264_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_70 = (x * x);
		t_sample x_71 = (x_70 * x_70);
		t_sample x_72 = (x_71 * x_71);
		t_sample x_73 = (x_72 * x_72);
		t_sample x_74 = (x_73 * x_73);
		return ((safediv((-((int)1)), (x_74 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_265_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_57 = (x * x);
		t_sample x_58 = (x_57 * x_57);
		t_sample x_59 = (x_58 * x_58);
		t_sample x_60 = (x_59 * x_59);
		t_sample x_61 = (x_60 * x_60);
		return ((safediv((-((int)1)), (x_61 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_266_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_44 = (x * x);
		t_sample x_45 = (x_44 * x_44);
		t_sample x_46 = (x_45 * x_45);
		t_sample x_47 = (x_46 * x_46);
		t_sample x_48 = (x_47 * x_47);
		return ((safediv((-((int)1)), (x_48 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_267_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_31 = (x * x);
		t_sample x_32 = (x_31 * x_31);
		t_sample x_33 = (x_32 * x_32);
		t_sample x_34 = (x_33 * x_33);
		t_sample x_35 = (x_34 * x_34);
		return ((safediv((-((int)1)), (x_35 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tanhLambert_d(t_sample x) {
		t_sample x2 = (x * x);
		t_sample a = ((((((x2 + ((int)378)) * x2) + ((int)17325)) * x2) + ((int)135135)) * x);
		t_sample b = ((((((((int)28) * x2) + ((int)3150)) * x2) + ((int)62370)) * x2) + ((int)135135));
		t_sample v_18 = safediv(a, b);
		int min_19 = (-((int)1));
		return ((v_18 <= min_19) ? min_19 : ((v_18 >= ((int)1)) ? ((int)1) : v_18));
		
	};
	inline t_sample tnhA_283_d(t_sample x) {
		x = (x * ((int)2));
		t_sample x_84 = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_85 = (x_84 * x_84);
		t_sample x_86 = (x_85 * x_85);
		t_sample x_87 = (x_86 * x_86);
		t_sample x_88 = (x_87 * x_87);
		t_sample x_89 = (x_88 * x_88);
		return ((safediv((-((int)1)), (x_89 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_285_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_70 = (x * x);
		t_sample x_71 = (x_70 * x_70);
		t_sample x_72 = (x_71 * x_71);
		t_sample x_73 = (x_72 * x_72);
		t_sample x_74 = (x_73 * x_73);
		return ((safediv((-((int)1)), (x_74 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_286_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_57 = (x * x);
		t_sample x_58 = (x_57 * x_57);
		t_sample x_59 = (x_58 * x_58);
		t_sample x_60 = (x_59 * x_59);
		t_sample x_61 = (x_60 * x_60);
		return ((safediv((-((int)1)), (x_61 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_284_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_44 = (x * x);
		t_sample x_45 = (x_44 * x_44);
		t_sample x_46 = (x_45 * x_45);
		t_sample x_47 = (x_46 * x_46);
		t_sample x_48 = (x_47 * x_47);
		return ((safediv((-((int)1)), (x_48 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_281_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_31 = (x * x);
		t_sample x_32 = (x_31 * x_31);
		t_sample x_33 = (x_32 * x_32);
		t_sample x_34 = (x_33 * x_33);
		t_sample x_35 = (x_34 * x_34);
		return ((safediv((-((int)1)), (x_35 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tanhLambert_282_d(t_sample x) {
		t_sample x2 = (x * x);
		t_sample a = ((((((x2 + ((int)378)) * x2) + ((int)17325)) * x2) + ((int)135135)) * x);
		t_sample b = ((((((((int)28) * x2) + ((int)3150)) * x2) + ((int)62370)) * x2) + ((int)135135));
		t_sample v_21 = safediv(a, b);
		int min_22 = (-((int)1));
		return ((v_21 <= min_22) ? min_22 : ((v_21 >= ((int)1)) ? ((int)1) : v_21));
		
	};
	
} State;


///
///	Configuration for the genlib API
///

/// Number of signal inputs and outputs

int gen_kernel_numins = 2;
int gen_kernel_numouts = 2;

int num_inputs() { return gen_kernel_numins; }
int num_outputs() { return gen_kernel_numouts; }
int num_params() { return 6; }

/// Assistive lables for the signal inputs and outputs

const char *gen_kernel_innames[] = { "in1", "in2" };
const char *gen_kernel_outnames[] = { "out1", "out2" };

/// Invoke the signal process of a State object

int perform(CommonState *cself, t_sample **ins, long numins, t_sample **outs, long numouts, long n) {
	State* self = (State *)cself;
	return self->perform(ins, outs, n);
}

/// Reset all parameters and stateful operators of a State object

void reset(CommonState *cself) {
	State* self = (State *)cself;
	self->reset(cself->sr, cself->vs);
}

/// Set a parameter of a State object

void setparameter(CommonState *cself, long index, t_param value, void *ref) {
	State *self = (State *)cself;
	switch (index) {
		case 0: self->set_A(value); break;
		case 1: self->set_B(value); break;
		case 2: self->set_C(value); break;
		case 3: self->set_D(value); break;
		case 4: self->set_Exp(value); break;
		case 5: self->set_Push(value); break;
		
		default: break;
	}
}

/// Get the value of a parameter of a State object

void getparameter(CommonState *cself, long index, t_param *value) {
	State *self = (State *)cself;
	switch (index) {
		case 0: *value = self->m_A_1; break;
		case 1: *value = self->m_B_6; break;
		case 2: *value = self->m_C_3; break;
		case 3: *value = self->m_D_2; break;
		case 4: *value = self->m_Exp_5; break;
		case 5: *value = self->m_Push_4; break;
		
		default: break;
	}
}

/// Get the name of a parameter of a State object

const char *getparametername(CommonState *cself, long index) {
	if (index >= 0 && index < cself->numparams) {
		return cself->params[index].name;
	}
	return 0;
}

/// Get the minimum value of a parameter of a State object

t_param getparametermin(CommonState *cself, long index) {
	if (index >= 0 && index < cself->numparams) {
		return cself->params[index].outputmin;
	}
	return 0;
}

/// Get the maximum value of a parameter of a State object

t_param getparametermax(CommonState *cself, long index) {
	if (index >= 0 && index < cself->numparams) {
		return cself->params[index].outputmax;
	}
	return 0;
}

/// Get parameter of a State object has a minimum and maximum value

char getparameterhasminmax(CommonState *cself, long index) {
	if (index >= 0 && index < cself->numparams) {
		return cself->params[index].hasminmax;
	}
	return 0;
}

/// Get the units of a parameter of a State object

const char *getparameterunits(CommonState *cself, long index) {
	if (index >= 0 && index < cself->numparams) {
		return cself->params[index].units;
	}
	return 0;
}

/// Get the size of the state of all parameters of a State object

size_t getstatesize(CommonState *cself) {
	return genlib_getstatesize(cself, &getparameter);
}

/// Get the state of all parameters of a State object

short getstate(CommonState *cself, char *state) {
	return genlib_getstate(cself, state, &getparameter);
}

/// set the state of all parameters of a State object

short setstate(CommonState *cself, const char *state) {
	return genlib_setstate(cself, state, &setparameter);
}

/// Allocate and configure a new State object and it's internal CommonState:

void *create(t_param sr, long vs) {
	State *self = new State;
	self->reset(sr, vs);
	ParamInfo *pi;
	self->__commonstate.inputnames = gen_kernel_innames;
	self->__commonstate.outputnames = gen_kernel_outnames;
	self->__commonstate.numins = gen_kernel_numins;
	self->__commonstate.numouts = gen_kernel_numouts;
	self->__commonstate.sr = sr;
	self->__commonstate.vs = vs;
	self->__commonstate.params = (ParamInfo *)genlib_sysmem_newptr(6 * sizeof(ParamInfo));
	self->__commonstate.numparams = 6;
	// initialize parameter 0 ("m_A_1")
	pi = self->__commonstate.params + 0;
	pi->name = "A";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_A_1;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 1 ("m_B_6")
	pi = self->__commonstate.params + 1;
	pi->name = "B";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_B_6;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 2 ("m_C_3")
	pi = self->__commonstate.params + 2;
	pi->name = "C";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_C_3;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 3 ("m_D_2")
	pi = self->__commonstate.params + 3;
	pi->name = "D";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_D_2;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 4 ("m_Exp_5")
	pi = self->__commonstate.params + 4;
	pi->name = "Exp";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_Exp_5;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 5 ("m_Push_4")
	pi = self->__commonstate.params + 5;
	pi->name = "Push";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_Push_4;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	
	return self;
}

/// Release all resources and memory used by a State object:

void destroy(CommonState *cself) {
	State *self = (State *)cself;
	genlib_sysmem_freeptr(cself->params);
		
	delete self;
}


} // GenTemplate::
