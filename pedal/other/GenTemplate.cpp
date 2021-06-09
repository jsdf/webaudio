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
	DCBlock __m_dcblock_22;
	DCBlock __m_dcblock_18;
	int __exception;
	int vectorsize;
	t_sample m_D_1;
	t_sample m_fT_13;
	t_sample m_history_12;
	t_sample m_history_14;
	t_sample m_history_15;
	t_sample m_history_16;
	t_sample m_history_11;
	t_sample m_history_17;
	t_sample samplerate;
	t_sample m_history_10;
	t_sample m_history_8;
	t_sample m_Push_3;
	t_sample m_C_2;
	t_sample m_w_21;
	t_sample m_B_4;
	t_sample m_Exp_6;
	t_sample m_A_5;
	t_sample m_fT_7;
	t_sample m_history_9;
	// re-initialize all member variables;
	inline void reset(t_param __sr, int __vs) {
		__exception = 0;
		vectorsize = __vs;
		samplerate = __sr;
		m_D_1 = ((int)0);
		m_C_2 = ((int)0);
		m_Push_3 = ((int)0);
		m_B_4 = ((int)0);
		m_A_5 = ((int)0);
		m_Exp_6 = ((int)0);
		m_fT_7 = ((int)0);
		m_history_8 = ((int)0);
		m_history_9 = ((int)0);
		m_history_10 = ((int)0);
		m_history_11 = ((int)0);
		m_history_12 = ((int)0);
		m_fT_13 = ((int)0);
		m_history_14 = ((int)0);
		m_history_15 = ((int)0);
		m_history_16 = ((int)0);
		m_history_17 = ((int)0);
		__m_dcblock_18.reset();
		m_w_21 = ((int)0);
		__m_dcblock_22.reset();
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
		t_sample mul_710 = (m_A_5 * ((int)1000));
		t_sample mul_4052 = (m_C_2 * ((int)128));
		t_sample clamp_3829 = ((mul_4052 <= ((int)1)) ? ((int)1) : ((mul_4052 >= ((int)128)) ? ((int)128) : mul_4052));
		t_sample add_3830 = (mul_710 + ((int)0));
		t_sample gen_3831 = add_3830;
		t_sample mul_3834 = (m_B_4 * ((int)4));
		t_sample add_3832 = (mul_3834 + ((int)0));
		t_sample gen_3833 = add_3832;
		t_sample nk_460 = gen_3833;
		t_sample nk_473 = nk_460;
		t_sample expr_628 = (gen_3831 * safediv(((t_sample)3.1415926535898), samplerate));
		t_sample x2 = (expr_628 * expr_628);
		t_sample x3 = (x2 * expr_628);
		t_sample x5 = (x2 * x3);
		t_sample expr_627 = (((x5 * ((t_sample)0.133333)) + (x3 * ((t_sample)0.333333))) + expr_628);
		t_sample gen_629 = expr_627;
		t_sample pass_609 = gen_629;
		t_sample pass_591 = gen_629;
		t_sample pass_573 = gen_629;
		t_sample pass_555 = gen_629;
		t_sample add_614 = (pass_609 + ((int)1));
		t_sample rdiv_613 = safediv(((int)1), add_614);
		t_sample add_599 = (pass_591 + ((int)1));
		t_sample rdiv_598 = safediv(((int)1), add_599);
		t_sample nk_469 = nk_460;
		t_sample add_581 = (pass_573 + ((int)1));
		t_sample rdiv_580 = safediv(((int)1), add_581);
		t_sample add_563 = (pass_555 + ((int)1));
		t_sample rdiv_562 = safediv(((int)1), add_563);
		t_sample nk_474 = nk_460;
		t_sample nk_464 = nk_460;
		t_sample nk_545 = nk_460;
		t_sample nk_479 = nk_460;
		t_sample mul_611 = (rdiv_613 * pass_609);
		t_sample mul_596 = (pass_591 * mul_611);
		t_sample mul_595 = (rdiv_598 * mul_596);
		t_sample mul_578 = (pass_573 * mul_595);
		t_sample mul_577 = (rdiv_580 * mul_578);
		t_sample mul_560 = (pass_555 * mul_577);
		t_sample mul_559 = (rdiv_562 * mul_560);
		t_sample ng_466 = mul_559;
		t_sample ng_471 = ng_466;
		t_sample mul_489 = (nk_469 * ng_471);
		t_sample ng_476 = ng_466;
		t_sample mul_501 = (nk_474 * ng_476);
		t_sample mul_525 = (nk_464 * ng_466);
		t_sample ng_462 = ng_466;
		t_sample mul_513 = (nk_460 * ng_462);
		t_sample ng_481 = ng_466;
		t_sample mul_537 = (nk_479 * ng_481);
		t_sample clamp_741 = ((mul_4052 <= ((int)1)) ? ((int)1) : ((mul_4052 >= ((int)128)) ? ((int)128) : mul_4052));
		int mul_747 = (((int)0) * samplerate);
		int max_746 = ((mul_747 < ((int)1)) ? ((int)1) : mul_747);
		t_sample rdiv_742 = safediv(((t_sample)0.693147), max_746);
		t_sample mul_764 = (m_B_4 * ((int)4));
		// the main sample loop;
		while ((__n--)) {
			const t_sample in1 = (*(__in1++));
			const t_sample in2 = (*(__in2++));
			t_sample nx_472 = in1;
			t_sample nx_468 = nx_472;
			t_sample add_617 = (m_history_8 + m_history_8);
			t_sample add_602 = (m_history_9 + m_history_9);
			t_sample add_584 = (m_history_10 + m_history_10);
			t_sample add_566 = (m_history_11 + m_history_11);
			t_sample nx_477 = nx_472;
			t_sample nx_544 = nx_472;
			t_sample div_546 = safediv(nx_544, nk_545);
			t_sample nx_463 = nx_472;
			t_sample nx_467 = nx_472;
			t_sample nx_483 = nx_472;
			t_sample mul_610 = (rdiv_613 * add_617);
			t_sample mul_594 = (pass_591 * mul_610);
			t_sample add_593 = (mul_594 + add_602);
			t_sample mul_592 = (rdiv_598 * add_593);
			t_sample mul_576 = (pass_573 * mul_592);
			t_sample add_575 = (mul_576 + add_584);
			t_sample mul_574 = (rdiv_580 * add_575);
			t_sample mul_558 = (pass_555 * mul_574);
			t_sample add_557 = (mul_558 + add_566);
			t_sample mul_556 = (rdiv_562 * add_557);
			t_sample ns_465 = mul_556;
			t_sample ns_470 = ns_465;
			t_sample ns_475 = ns_465;
			t_sample ns_461 = ns_465;
			t_sample ns_480 = ns_465;
			t_sample add_553 = (mul_556 + mul_559);
			t_sample mul_551 = (add_553 * nk_545);
			int gte_550 = (nx_544 >= mul_551);
			t_sample sub_554 = (mul_556 - mul_559);
			t_sample mul_552 = (sub_554 * nk_545);
			int lte_549 = (nx_544 <= mul_552);
			t_sample switch_547 = (lte_549 ? sub_554 : div_546);
			t_sample switch_548 = (gte_550 ? add_553 : switch_547);
			t_sample pass_482 = switch_548;
			t_sample mul_543 = (nk_479 * pass_482);
			t_sample sub_542 = (nx_483 - mul_543);
			t_sample expr_457 = tnhA_d(sub_542);
			t_sample gen_458 = expr_457;
			t_sample mul_541 = (gen_458 * ng_481);
			t_sample add_540 = (mul_541 + ns_480);
			t_sample sub_539 = (add_540 - pass_482);
			t_sample mul_536 = (gen_458 * gen_458);
			t_sample sub_535 = (mul_536 - ((int)1));
			t_sample mul_534 = (mul_537 * sub_535);
			t_sample sub_533 = (mul_534 - ((int)1));
			t_sample div_538 = safediv(sub_539, sub_533);
			t_sample sub_532 = (pass_482 - div_538);
			t_sample mul_531 = (nk_464 * sub_532);
			t_sample sub_530 = (nx_467 - mul_531);
			t_sample expr_442 = tnhA_631_d(sub_530);
			t_sample gen_443 = expr_442;
			t_sample mul_529 = (gen_443 * ng_466);
			t_sample add_528 = (mul_529 + ns_465);
			t_sample sub_527 = (add_528 - sub_532);
			t_sample mul_524 = (gen_443 * gen_443);
			t_sample sub_523 = (mul_524 - ((int)1));
			t_sample mul_522 = (mul_525 * sub_523);
			t_sample sub_521 = (mul_522 - ((int)1));
			t_sample div_526 = safediv(sub_527, sub_521);
			t_sample sub_520 = (sub_532 - div_526);
			t_sample mul_519 = (nk_460 * sub_520);
			t_sample sub_518 = (nx_463 - mul_519);
			t_sample expr_429 = tnhA_632_d(sub_518);
			t_sample gen_430 = expr_429;
			t_sample mul_517 = (gen_430 * ng_462);
			t_sample add_516 = (mul_517 + ns_461);
			t_sample sub_515 = (add_516 - sub_520);
			t_sample mul_512 = (gen_430 * gen_430);
			t_sample sub_511 = (mul_512 - ((int)1));
			t_sample mul_510 = (mul_513 * sub_511);
			t_sample sub_509 = (mul_510 - ((int)1));
			t_sample div_514 = safediv(sub_515, sub_509);
			t_sample sub_508 = (sub_520 - div_514);
			t_sample pass_478 = sub_508;
			t_sample mul_507 = (nk_474 * pass_478);
			t_sample sub_506 = (nx_477 - mul_507);
			t_sample expr_416 = tnhA_633_d(sub_506);
			t_sample gen_417 = expr_416;
			t_sample mul_505 = (gen_417 * ng_476);
			t_sample add_504 = (mul_505 + ns_475);
			t_sample sub_503 = (add_504 - pass_478);
			t_sample mul_500 = (gen_417 * gen_417);
			t_sample sub_499 = (mul_500 - ((int)1));
			t_sample mul_498 = (mul_501 * sub_499);
			t_sample sub_497 = (mul_498 - ((int)1));
			t_sample div_502 = safediv(sub_503, sub_497);
			t_sample sub_496 = (pass_478 - div_502);
			t_sample mul_495 = (nk_469 * sub_496);
			t_sample sub_494 = (nx_472 - mul_495);
			t_sample expr_403 = tnhA_634_d(sub_494);
			t_sample gen_404 = expr_403;
			t_sample mul_493 = (gen_404 * ng_471);
			t_sample add_492 = (mul_493 + ns_470);
			t_sample sub_491 = (add_492 - sub_496);
			t_sample mul_488 = (gen_404 * gen_404);
			t_sample sub_487 = (mul_488 - ((int)1));
			t_sample mul_486 = (mul_489 * sub_487);
			t_sample sub_485 = (mul_486 - ((int)1));
			t_sample div_490 = safediv(sub_491, sub_485);
			t_sample sub_484 = (sub_496 - div_490);
			t_sample expr_630 = (nx_468 - (nk_473 * sub_484));
			t_sample mul_383 = (((t_sample)0.999) * m_fT_7);
			t_sample add_384 = (mul_383 + ((t_sample)0.001028652));
			t_sample gen_387 = add_384;
			t_sample fT_next_386 = fixdenorm(add_384);
			t_sample rdiv_376 = safediv(((int)1), gen_387);
			t_sample dcblock_388 = __m_dcblock_18(expr_630);
			t_sample mul_380 = (dcblock_388 * rdiv_376);
			t_sample expr_378 = tanhLambert_d(mul_380);
			t_sample gen_379 = expr_378;
			t_sample mul_381 = (gen_379 * gen_387);
			t_sample gen_391 = mul_381;
			t_sample pass_623 = gen_391;
			t_sample mul_616 = (pass_623 * pass_609);
			t_sample add_615 = (mul_616 + add_617);
			t_sample mul_612 = (add_615 * rdiv_613);
			t_sample sub_622 = (pass_623 - mul_612);
			t_sample mul_621 = (sub_622 * pass_609);
			t_sample add_620 = (mul_621 + m_history_8);
			t_sample add_618 = (add_620 + m_history_8);
			t_sample pass_608 = add_618;
			t_sample mul_601 = (pass_608 * pass_591);
			t_sample add_600 = (mul_601 + add_602);
			t_sample mul_597 = (add_600 * rdiv_598);
			t_sample sub_607 = (pass_608 - mul_597);
			t_sample mul_606 = (sub_607 * pass_591);
			t_sample add_605 = (mul_606 + m_history_9);
			t_sample add_603 = (add_605 + m_history_9);
			t_sample pass_590 = add_603;
			t_sample mul_583 = (pass_590 * pass_573);
			t_sample add_582 = (mul_583 + add_584);
			t_sample mul_579 = (add_582 * rdiv_580);
			t_sample sub_589 = (pass_590 - mul_579);
			t_sample mul_588 = (sub_589 * pass_573);
			t_sample add_587 = (mul_588 + m_history_10);
			t_sample add_585 = (add_587 + m_history_10);
			t_sample pass_572 = add_585;
			t_sample mul_565 = (pass_572 * pass_555);
			t_sample add_564 = (mul_565 + add_566);
			t_sample mul_561 = (add_564 * rdiv_562);
			t_sample sub_571 = (pass_572 - mul_561);
			t_sample mul_570 = (sub_571 * pass_555);
			t_sample add_569 = (mul_570 + m_history_11);
			t_sample history_619_next_635 = fixdenorm(add_620);
			t_sample history_604_next_636 = fixdenorm(add_605);
			t_sample history_586_next_637 = fixdenorm(add_587);
			t_sample history_568_next_638 = fixdenorm(add_569);
			t_sample mul_3828 = (sub_484 * clamp_3829);
			t_sample tanh_3836 = tanh(mul_3828);
			t_sample mul_3592 = (tanh_3836 * m_D_1);
			t_sample out1 = mul_3592;
			t_sample sub_745 = (mul_710 - m_history_12);
			t_sample mul_744 = (sub_745 * rdiv_742);
			t_sample add_748 = (mul_744 + m_history_12);
			t_sample gen_750 = add_748;
			t_sample history_743_next_749 = fixdenorm(add_748);
			t_sample expr_762 = expsmooth_d_d(mul_764, ((t_sample)0.022666));
			t_sample gen_763 = expr_762;
			t_sample nx_4081 = in2;
			t_sample nx_4105 = nx_4081;
			t_sample nk_4171 = gen_763;
			t_sample nk_4255 = nk_4171;
			t_sample expr_4254 = (gen_750 * safediv(((t_sample)3.1415926535898), samplerate));
			t_sample x_4235 = (expr_4254 * expr_4254);
			t_sample x_4225 = (x_4235 * expr_4254);
			t_sample x_4060 = (x_4235 * x_4225);
			t_sample expr_4177 = (((x_4060 * ((t_sample)0.133333)) + (x_4225 * ((t_sample)0.333333))) + expr_4254);
			t_sample gen_4148 = expr_4177;
			t_sample pass_4111 = gen_4148;
			t_sample pass_4100 = gen_4148;
			t_sample pass_4182 = gen_4148;
			t_sample pass_4181 = gen_4148;
			t_sample add_4143 = (m_history_14 + m_history_14);
			t_sample add_4097 = (pass_4111 + ((int)1));
			t_sample rdiv_4230 = safediv(((int)1), add_4097);
			t_sample add_4244 = (m_history_15 + m_history_15);
			t_sample add_4245 = (pass_4100 + ((int)1));
			t_sample rdiv_4259 = safediv(((int)1), add_4245);
			t_sample nk_4114 = nk_4171;
			t_sample add_4109 = (m_history_16 + m_history_16);
			t_sample add_4139 = (pass_4182 + ((int)1));
			t_sample rdiv_4198 = safediv(((int)1), add_4139);
			t_sample add_4196 = (m_history_17 + m_history_17);
			t_sample add_4190 = (pass_4181 + ((int)1));
			t_sample rdiv_4203 = safediv(((int)1), add_4190);
			t_sample nk_4120 = nk_4171;
			t_sample nx_4117 = nx_4081;
			t_sample nx_4167 = nx_4081;
			t_sample nk_4232 = nk_4171;
			t_sample nk_4164 = nk_4171;
			t_sample div_4211 = safediv(nx_4167, nk_4164);
			t_sample nk_4090 = nk_4171;
			t_sample nx_4243 = nx_4081;
			t_sample nx_4242 = nx_4081;
			t_sample nx_4116 = nx_4081;
			t_sample mul_4187 = (rdiv_4230 * pass_4111);
			t_sample mul_4193 = (pass_4100 * mul_4187);
			t_sample mul_4124 = (rdiv_4259 * mul_4193);
			t_sample mul_4246 = (pass_4182 * mul_4124);
			t_sample mul_4155 = (rdiv_4198 * mul_4246);
			t_sample mul_4238 = (pass_4181 * mul_4155);
			t_sample mul_4161 = (rdiv_4203 * mul_4238);
			t_sample ng_4178 = mul_4161;
			t_sample ng_4132 = ng_4178;
			t_sample mul_4252 = (nk_4114 * ng_4132);
			t_sample ng_4062 = ng_4178;
			t_sample mul_4173 = (nk_4120 * ng_4062);
			t_sample mul_4110 = (nk_4232 * ng_4178);
			t_sample ng_4231 = ng_4178;
			t_sample mul_4106 = (nk_4171 * ng_4231);
			t_sample ng_4200 = ng_4178;
			t_sample mul_4078 = (nk_4090 * ng_4200);
			t_sample mul_4135 = (rdiv_4230 * add_4143);
			t_sample mul_4133 = (pass_4100 * mul_4135);
			t_sample add_4260 = (mul_4133 + add_4244);
			t_sample mul_4213 = (rdiv_4259 * add_4260);
			t_sample mul_4241 = (pass_4182 * mul_4213);
			t_sample add_4217 = (mul_4241 + add_4109);
			t_sample mul_4176 = (rdiv_4198 * add_4217);
			t_sample mul_4165 = (pass_4181 * mul_4176);
			t_sample add_4091 = (mul_4165 + add_4196);
			t_sample mul_4257 = (rdiv_4203 * add_4091);
			t_sample ns_4098 = mul_4257;
			t_sample ns_4249 = ns_4098;
			t_sample ns_4208 = ns_4098;
			t_sample ns_4205 = ns_4098;
			t_sample ns_4149 = ns_4098;
			t_sample add_4239 = (mul_4257 + mul_4161);
			t_sample mul_4107 = (add_4239 * nk_4164);
			int gte_4128 = (nx_4167 >= mul_4107);
			t_sample sub_4063 = (mul_4257 - mul_4161);
			t_sample mul_4199 = (sub_4063 * nk_4164);
			int lte_4123 = (nx_4167 <= mul_4199);
			t_sample switch_4066 = (lte_4123 ? sub_4063 : div_4211);
			t_sample switch_4207 = (gte_4128 ? add_4239 : switch_4066);
			t_sample pass_4079 = switch_4207;
			t_sample mul_4194 = (nk_4090 * pass_4079);
			t_sample sub_4219 = (nx_4116 - mul_4194);
			t_sample expr_4122 = tnhA_4053_d(sub_4219);
			t_sample gen_4070 = expr_4122;
			t_sample mul_4214 = (gen_4070 * ng_4200);
			t_sample add_4234 = (mul_4214 + ns_4149);
			t_sample sub_4113 = (add_4234 - pass_4079);
			t_sample mul_4227 = (gen_4070 * gen_4070);
			t_sample sub_4121 = (mul_4227 - ((int)1));
			t_sample mul_4170 = (mul_4078 * sub_4121);
			t_sample sub_4153 = (mul_4170 - ((int)1));
			t_sample div_4248 = safediv(sub_4113, sub_4153);
			t_sample sub_4172 = (pass_4079 - div_4248);
			t_sample mul_4129 = (nk_4232 * sub_4172);
			t_sample sub_4210 = (nx_4242 - mul_4129);
			t_sample expr_4169 = tnhA_4054_d(sub_4210);
			t_sample gen_4094 = expr_4169;
			t_sample mul_4258 = (gen_4094 * ng_4178);
			t_sample add_4102 = (mul_4258 + ns_4098);
			t_sample sub_4256 = (add_4102 - sub_4172);
			t_sample mul_4068 = (gen_4094 * gen_4094);
			t_sample sub_4236 = (mul_4068 - ((int)1));
			t_sample mul_4240 = (mul_4110 * sub_4236);
			t_sample sub_4223 = (mul_4240 - ((int)1));
			t_sample div_4064 = safediv(sub_4256, sub_4223);
			t_sample sub_4216 = (sub_4172 - div_4064);
			t_sample mul_4085 = (nk_4171 * sub_4216);
			t_sample sub_4152 = (nx_4243 - mul_4085);
			t_sample expr_4179 = tnhA_4058_d(sub_4152);
			t_sample gen_4192 = expr_4179;
			t_sample mul_4131 = (gen_4192 * ng_4231);
			t_sample add_4093 = (mul_4131 + ns_4205);
			t_sample sub_4073 = (add_4093 - sub_4216);
			t_sample mul_4096 = (gen_4192 * gen_4192);
			t_sample sub_4228 = (mul_4096 - ((int)1));
			t_sample mul_4067 = (mul_4106 * sub_4228);
			t_sample sub_4166 = (mul_4067 - ((int)1));
			t_sample div_4226 = safediv(sub_4073, sub_4166);
			t_sample sub_4251 = (sub_4216 - div_4226);
			t_sample pass_4137 = sub_4251;
			t_sample mul_4195 = (nk_4120 * pass_4137);
			t_sample sub_4222 = (nx_4117 - mul_4195);
			t_sample expr_4188 = tnhA_4056_d(sub_4222);
			t_sample gen_4127 = expr_4188;
			t_sample mul_4072 = (gen_4127 * ng_4062);
			t_sample add_4185 = (mul_4072 + ns_4208);
			t_sample sub_4101 = (add_4185 - pass_4137);
			t_sample mul_4108 = (gen_4127 * gen_4127);
			t_sample sub_4159 = (mul_4108 - ((int)1));
			t_sample mul_4069 = (mul_4173 * sub_4159);
			t_sample sub_4136 = (mul_4069 - ((int)1));
			t_sample div_4220 = safediv(sub_4101, sub_4136);
			t_sample sub_4218 = (pass_4137 - div_4220);
			t_sample mul_4126 = (nk_4114 * sub_4218);
			t_sample sub_4140 = (nx_4081 - mul_4126);
			t_sample expr_4138 = tnhA_4057_d(sub_4140);
			t_sample gen_4189 = expr_4138;
			t_sample mul_4104 = (gen_4189 * ng_4132);
			t_sample add_4065 = (mul_4104 + ns_4249);
			t_sample sub_4212 = (add_4065 - sub_4218);
			t_sample mul_4209 = (gen_4189 * gen_4189);
			t_sample sub_4151 = (mul_4209 - ((int)1));
			t_sample mul_4221 = (mul_4252 * sub_4151);
			t_sample sub_4074 = (mul_4221 - ((int)1));
			t_sample div_4142 = safediv(sub_4212, sub_4074);
			t_sample sub_4174 = (sub_4218 - div_4142);
			t_sample expr_4088 = (nx_4105 - (nk_4255 * sub_4174));
			t_sample mul_4201 = (((t_sample)0.999) * m_fT_13);
			t_sample add_4089 = (mul_4201 + ((t_sample)0.001028652));
			t_sample gen_4059 = add_4089;
			t_sample fT_next_4253 = fixdenorm(add_4089);
			t_sample rdiv_4125 = safediv(((int)1), gen_4059);
			t_sample dcblock_4077 = __m_dcblock_22(expr_4088);
			t_sample mul_4119 = (dcblock_4077 * rdiv_4125);
			t_sample expr_4154 = tanhLambert_4055_d(mul_4119);
			t_sample gen_4160 = expr_4154;
			t_sample mul_4215 = (gen_4160 * gen_4059);
			t_sample gen_4083 = mul_4215;
			t_sample pass_4204 = gen_4083;
			t_sample mul_4250 = (pass_4204 * pass_4111);
			t_sample add_4247 = (mul_4250 + add_4143);
			t_sample mul_4184 = (add_4247 * rdiv_4230);
			t_sample sub_4183 = (pass_4204 - mul_4184);
			t_sample mul_4191 = (sub_4183 * pass_4111);
			t_sample add_4086 = (mul_4191 + m_history_14);
			t_sample add_4175 = (add_4086 + m_history_14);
			t_sample pass_4186 = add_4175;
			t_sample mul_4150 = (pass_4186 * pass_4100);
			t_sample add_4087 = (mul_4150 + add_4244);
			t_sample mul_4237 = (add_4087 * rdiv_4259);
			t_sample sub_4115 = (pass_4186 - mul_4237);
			t_sample mul_4168 = (sub_4115 * pass_4100);
			t_sample add_4163 = (mul_4168 + m_history_15);
			t_sample add_4112 = (add_4163 + m_history_15);
			t_sample pass_4075 = add_4112;
			t_sample mul_4162 = (pass_4075 * pass_4182);
			t_sample add_4158 = (mul_4162 + add_4109);
			t_sample mul_4095 = (add_4158 * rdiv_4198);
			t_sample sub_4157 = (pass_4075 - mul_4095);
			t_sample mul_4092 = (sub_4157 * pass_4182);
			t_sample add_4156 = (mul_4092 + m_history_16);
			t_sample add_4082 = (add_4156 + m_history_16);
			t_sample pass_4071 = add_4082;
			t_sample mul_4103 = (pass_4071 * pass_4181);
			t_sample add_4206 = (mul_4103 + add_4196);
			t_sample mul_4061 = (add_4206 * rdiv_4203);
			t_sample sub_4147 = (pass_4071 - mul_4061);
			t_sample mul_4076 = (sub_4147 * pass_4181);
			t_sample add_4146 = (mul_4076 + m_history_17);
			t_sample history_619_next_4144 = fixdenorm(add_4086);
			t_sample history_604_next_4141 = fixdenorm(add_4163);
			t_sample history_586_next_4080 = fixdenorm(add_4156);
			t_sample history_568_next_4224 = fixdenorm(add_4146);
			t_sample mul_740 = (sub_4174 * clamp_741);
			t_sample tanh_766 = tanh(mul_740);
			t_sample mul_3356 = (tanh_766 * m_D_1);
			t_sample out2 = mul_3356;
			m_fT_7 = fT_next_386;
			m_fT_13 = fT_next_4253;
			m_history_17 = history_568_next_4224;
			m_history_16 = history_586_next_4080;
			m_history_15 = history_604_next_4141;
			m_history_14 = history_619_next_4144;
			m_history_12 = history_743_next_749;
			m_history_11 = history_568_next_638;
			m_history_10 = history_586_next_637;
			m_history_9 = history_604_next_636;
			m_history_8 = history_619_next_635;
			// assign results to output buffer;
			(*(__out1++)) = out1;
			(*(__out2++)) = out2;
			
		};
		return __exception;
		
	};
	inline void set_D(t_param _value) {
		m_D_1 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_C(t_param _value) {
		m_C_2 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_Push(t_param _value) {
		m_Push_3 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_B(t_param _value) {
		m_B_4 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_A(t_param _value) {
		m_A_5 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline void set_Exp(t_param _value) {
		m_Exp_6 = (_value < 0 ? 0 : (_value > 1 ? 1 : _value));
	};
	inline t_sample tnhA_d(t_sample x) {
		x = (x * ((int)2));
		t_sample x_451 = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_452 = (x_451 * x_451);
		t_sample x_453 = (x_452 * x_452);
		t_sample x_454 = (x_453 * x_453);
		t_sample x_455 = (x_454 * x_454);
		t_sample x_456 = (x_455 * x_455);
		return ((safediv((-((int)1)), (x_456 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_631_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_437 = (x * x);
		t_sample x_438 = (x_437 * x_437);
		t_sample x_439 = (x_438 * x_438);
		t_sample x_440 = (x_439 * x_439);
		t_sample x_441 = (x_440 * x_440);
		return ((safediv((-((int)1)), (x_441 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_632_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_424 = (x * x);
		t_sample x_425 = (x_424 * x_424);
		t_sample x_426 = (x_425 * x_425);
		t_sample x_427 = (x_426 * x_426);
		t_sample x_428 = (x_427 * x_427);
		return ((safediv((-((int)1)), (x_428 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_633_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_411 = (x * x);
		t_sample x_412 = (x_411 * x_411);
		t_sample x_413 = (x_412 * x_412);
		t_sample x_414 = (x_413 * x_413);
		t_sample x_415 = (x_414 * x_414);
		return ((safediv((-((int)1)), (x_415 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_634_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_398 = (x * x);
		t_sample x_399 = (x_398 * x_398);
		t_sample x_400 = (x_399 * x_399);
		t_sample x_401 = (x_400 * x_400);
		t_sample x_402 = (x_401 * x_401);
		return ((safediv((-((int)1)), (x_402 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tanhLambert_d(t_sample x) {
		t_sample x2 = (x * x);
		t_sample a = ((((((x2 + ((int)378)) * x2) + ((int)17325)) * x2) + ((int)135135)) * x);
		t_sample b = ((((((((int)28) * x2) + ((int)3150)) * x2) + ((int)62370)) * x2) + ((int)135135));
		t_sample v_19 = safediv(a, b);
		int min_20 = (-((int)1));
		return ((v_19 <= min_20) ? min_20 : ((v_19 >= ((int)1)) ? ((int)1) : v_19));
		
	};
	inline t_sample expsmooth_d_d(t_sample x, t_sample t) {
		t_sample z = tauA_d(t);
		t_sample y = ((z * m_w_21) + (x * (((int)1) - z)));
		m_w_21 = y;
		return y;
		
	};
	inline t_sample tauA_d(t_sample t) {
		t_sample y = expA_d(safediv((-((int)1)), (t * samplerate)));
		return (y + ((t_sample)0.000128));
		
	};
	inline t_sample expA_d(t_sample x0) {
		t_sample x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x0)) * x0)) * x0));
		t_sample x_757 = (x * x);
		t_sample x_758 = (x_757 * x_757);
		t_sample x_759 = (x_758 * x_758);
		t_sample x_760 = (x_759 * x_759);
		t_sample x_761 = (x_760 * x_760);
		return x_761;
		
	};
	inline t_sample tnhA_4053_d(t_sample x) {
		x = (x * ((int)2));
		t_sample x_451 = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_452 = (x_451 * x_451);
		t_sample x_453 = (x_452 * x_452);
		t_sample x_454 = (x_453 * x_453);
		t_sample x_455 = (x_454 * x_454);
		t_sample x_456 = (x_455 * x_455);
		return ((safediv((-((int)1)), (x_456 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_4054_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_437 = (x * x);
		t_sample x_438 = (x_437 * x_437);
		t_sample x_439 = (x_438 * x_438);
		t_sample x_440 = (x_439 * x_439);
		t_sample x_441 = (x_440 * x_440);
		return ((safediv((-((int)1)), (x_441 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_4058_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_424 = (x * x);
		t_sample x_425 = (x_424 * x_424);
		t_sample x_426 = (x_425 * x_425);
		t_sample x_427 = (x_426 * x_426);
		t_sample x_428 = (x_427 * x_427);
		return ((safediv((-((int)1)), (x_428 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_4056_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_411 = (x * x);
		t_sample x_412 = (x_411 * x_411);
		t_sample x_413 = (x_412 * x_412);
		t_sample x_414 = (x_413 * x_413);
		t_sample x_415 = (x_414 * x_414);
		return ((safediv((-((int)1)), (x_415 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tnhA_4057_d(t_sample x) {
		x = (((t_sample)0.999996) + ((((t_sample)0.031261316) + ((((t_sample)0.00048274797) + (((t_sample)6e-06) * x)) * x)) * x));
		t_sample x_398 = (x * x);
		t_sample x_399 = (x_398 * x_398);
		t_sample x_400 = (x_399 * x_399);
		t_sample x_401 = (x_400 * x_400);
		t_sample x_402 = (x_401 * x_401);
		return ((safediv((-((int)1)), (x_402 + ((int)1))) * ((int)2)) + ((int)1));
		
	};
	inline t_sample tanhLambert_4055_d(t_sample x) {
		t_sample x2 = (x * x);
		t_sample a = ((((((x2 + ((int)378)) * x2) + ((int)17325)) * x2) + ((int)135135)) * x);
		t_sample b = ((((((((int)28) * x2) + ((int)3150)) * x2) + ((int)62370)) * x2) + ((int)135135));
		t_sample v_23 = safediv(a, b);
		int min_24 = (-((int)1));
		return ((v_23 <= min_24) ? min_24 : ((v_23 >= ((int)1)) ? ((int)1) : v_23));
		
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
		case 0: *value = self->m_A_5; break;
		case 1: *value = self->m_B_4; break;
		case 2: *value = self->m_C_2; break;
		case 3: *value = self->m_D_1; break;
		case 4: *value = self->m_Exp_6; break;
		case 5: *value = self->m_Push_3; break;
		
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
	// initialize parameter 0 ("m_A_5")
	pi = self->__commonstate.params + 0;
	pi->name = "A";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_A_5;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 1 ("m_B_4")
	pi = self->__commonstate.params + 1;
	pi->name = "B";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_B_4;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 2 ("m_C_2")
	pi = self->__commonstate.params + 2;
	pi->name = "C";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_C_2;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 3 ("m_D_1")
	pi = self->__commonstate.params + 3;
	pi->name = "D";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_D_1;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 4 ("m_Exp_6")
	pi = self->__commonstate.params + 4;
	pi->name = "Exp";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_Exp_6;
	pi->defaultref = 0;
	pi->hasinputminmax = false;
	pi->inputmin = 0;
	pi->inputmax = 1;
	pi->hasminmax = true;
	pi->outputmin = 0;
	pi->outputmax = 1;
	pi->exp = 0;
	pi->units = "";		// no units defined
	// initialize parameter 5 ("m_Push_3")
	pi = self->__commonstate.params + 5;
	pi->name = "Push";
	pi->paramtype = GENLIB_PARAMTYPE_FLOAT;
	pi->defaultvalue = self->m_Push_3;
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
