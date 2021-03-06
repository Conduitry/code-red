import * as assert from 'assert';
import { x, b, print } from '../src/index';

const d = (str: string) => str.replace(/^\t{5}/gm, '').trim();

describe('codered', () => {
	describe('b', () => {
		it('creates a block of nodes', () => {
			assert.deepEqual(b`
				a = b + c;
				d = e + f;
			`, [
				{
					type: 'ExpressionStatement',
					expression: {
						type: 'AssignmentExpression',
						left: { type: 'Identifier', name: 'a' },
						operator: '=',
						right: {
							type: 'BinaryExpression',
							left: { type: 'Identifier', name: 'b' },
							operator: '+',
							right: { type: 'Identifier', name: 'c' },
						}
					}
				},
				{
					type: 'ExpressionStatement',
					expression: {
						type: 'AssignmentExpression',
						left: { type: 'Identifier', name: 'd' },
						operator: '=',
						right: {
							type: 'BinaryExpression',
							left: { type: 'Identifier', name: 'e' },
							operator: '+',
							right: { type: 'Identifier', name: 'f' },
						}
					}
				}
			]);
		});
	});

	describe('x', () => {
		it('creates a single expression', () => {
			assert.deepEqual(x`
				a = b + c
			`, {
				type: 'AssignmentExpression',
				left: { type: 'Identifier', name: 'a' },
				operator: '=',
				right: {
					type: 'BinaryExpression',
					left: { type: 'Identifier', name: 'b' },
					operator: '+',
					right: { type: 'Identifier', name: 'c' },
				}
			});
		});

		it('inserts values', () => {
			const name = { x: 'name' };
			const param = { x: 'param' };

			const node = x`
				function ${name}(${param}) {
					return ${param} * 2;
				}
			`;

			assert.deepEqual(node, {
				type: 'FunctionExpression',
				id: name,
				expression: false,
				generator: false,
				async: false,
				params: [
					param
				],
				body: {
					type: 'BlockStatement',
					body: [{
						type: 'ReturnStatement',
						argument: {
							type: 'BinaryExpression',
							left: param,
							operator: '*',
							right: { type: 'Literal', value: 2, raw: '2' }
						}
					}]
				}
			});
		});
	});

	describe('print', () => {
		it('prints a node', () => {
			const node = x`a  =  (b + c)`;

			const { code } = print(node);

			assert.equal(code, `a = b + c`);
		});

		it('prints a function with single inserted parameter', () => {
			const param = x`bar`;

			const node = x`function foo(${param}) {
				return ${param} * 2;
			}`;

			const { code } = print(node);

			assert.equal(
				code,
				d(`
					function foo(bar) {
						return bar * 2;
					}
				`)
			);
		});

		it('prints a function with multiple inserted parameters', () => {
			const bar = x`bar`;
			const baz = x`baz`;

			const params = x`${bar}, ${baz}`;

			const node = x`function foo(${params}) {
				return ${bar} * ${baz};
			}`;

			const { code } = print(node);

			assert.equal(
				code,
				d(`
					function foo(bar, baz) {
						return bar * baz;
					}
				`)
			);
		});
	});
});
