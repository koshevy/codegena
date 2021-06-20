# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 3.0.0-alpha.3 (2021-06-20)


### Features

* **oapi3ts:** support `nullable` in `additionalProperties` ([ac0b119](https://github.com/koshevy/codegena/commit/ac0b1191c1d7721a01989295520201b92e5bfdbc))





# 3.0.0-alpha.2 (2021-06-13)

**Note:** Version bump only for package @codegena/oapi3ts





# [3.0.0-alpha.1](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@3.0.0-alpha.0...@codegena/oapi3ts@3.0.0-alpha.1) (2021-06-09)

**Note:** Version bump only for package @codegena/oapi3ts





# [3.0.0-alpha.0](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.2.0-alpha.2...@codegena/oapi3ts@3.0.0-alpha.0) (2021-06-09)


### Code Refactoring

* **oapi3ts:** applying new public contract for oapi3ts ([ea8877d](https://github.com/koshevy/codegena/commit/ea8877d80145191b1b65ea6698eefcd4dba15b81))


### Features

* **oapi3ts:** support Oas3Server interface for servers list ([3ae0e58](https://github.com/koshevy/codegena/commit/3ae0e5883121e47f317276bd1d4fbd006ec3d966))


### BREAKING CHANGES

* **oapi3ts:** signature of `Operation` changed
* **oapi3ts:** No more support legacy `BaseConvertor`, `Convertor` and `DataTypeDescriptor`! Use `Facade` instead.





# [2.2.0-alpha.2](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.2.0-alpha.1...@codegena/oapi3ts@2.2.0-alpha.2) (2020-08-19)


### Bug Fixes

* **oapi3ts:** update supporting `nullable` option ([2474b71](https://github.com/koshevy/codegena/commit/2474b71c0a3b22e0bcf34f13e672c2bc4522d9ab)), closes [#39](https://github.com/koshevy/codegena/issues/39)





# [2.2.0-alpha.1](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.2.0-alpha.0...@codegena/oapi3ts@2.2.0-alpha.1) (2020-08-16)


### Bug Fixes

* **oapi3ts:** fix supporting `nullable` option ([620718f](https://github.com/koshevy/codegena/commit/620718f499253178606a5c7e80f4ef219fd11d99)), closes [#39](https://github.com/koshevy/codegena/issues/39)





# [2.2.0-alpha.0](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.1.9-alpha.3...@codegena/oapi3ts@2.2.0-alpha.0) (2020-05-17)


### Bug Fixes

* **oapi3ts:** fix multiply recursive themself dependencies ([f204833](https://github.com/koshevy/codegena/commit/f204833be942d1bd720f2998d9da239ff6c1052a))


### Features

* **oapi3ts:** properties with $ref and title/description now have own comments ([4b8b89c](https://github.com/koshevy/codegena/commit/4b8b89c52df528d8ac9c6b2fd346f62b68877279))





## [2.1.9-alpha.3](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.1.9-alpha.2...@codegena/oapi3ts@2.1.9-alpha.3) (2020-05-04)


### Bug Fixes

* **oapi3ts:** wrong enums rendering ([b3feec5](https://github.com/koshevy/codegena/commit/b3feec5dfeb6d60e7eb6ff0a953a25b4fe9d9969)), closes [#29](https://github.com/koshevy/codegena/issues/29)





## 2.1.9-alpha.2 (2020-05-03)

**Note:** Version bump only for package @codegena/oapi3ts





## 2.1.9-alpha.1 (2020-05-01)

**Note:** Version bump only for package @codegena/oapi3ts





## 2.1.9-alpha.0 (2020-04-30)

**Note:** Version bump only for package @codegena/oapi3ts





## 2.1.8 (2020-04-25)

**Note:** Version bump only for package @codegena/oapi3ts





## 2.1.7 (2020-04-25)

**Note:** Version bump only for package @codegena/oapi3ts





## 2.1.6 (2020-04-13)

**Note:** Version bump only for package @codegena/oapi3ts





## [2.1.5](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.1.4...@codegena/oapi3ts@2.1.5) (2020-03-29)


### Bug Fixes

* **oapi3ts:** get rid of most of optionalDependencies and move them to devDependencies ([83a0023](https://github.com/koshevy/codegena/commit/83a0023ad88b3f4e14545a2cd275b989cdc2b45e))





## [2.1.4](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.1.3...@codegena/oapi3ts@2.1.4) (2020-03-05)


### Bug Fixes

* **oapi3ts:** hotfix for case with numeric enums ([ff2a21f](https://github.com/koshevy/codegena/commit/ff2a21f10697d0ebe6eb91cf2baf5377cd3d79ab)), closes [#10](https://github.com/koshevy/codegena/issues/10)





## [2.1.3](https://github.com/koshevy/codegena/compare/@codegena/oapi3ts@2.1.2...@codegena/oapi3ts@2.1.3) (2020-01-26)

**Note:** Version bump only for package @codegena/oapi3ts





## 2.1.2 (2020-01-26)


### Bug Fixes

* dependencies are not installing correct ([3aa8c46](https://github.com/koshevy/codegena/commit/3aa8c4600d00fe5af97a22c8f0c803bb5642a1bd)), closes [#6](https://github.com/koshevy/codegena/issues/6)
* make correct applying of `required` for inherited properties ([44e8588](https://github.com/koshevy/codegena/commit/44e85885d9752e733a8ec7cc70bbaec83a96a4e5))
* prettier had been leading unsatisfied @microsoft/typescript-etw dependency ([21e3e0e](https://github.com/koshevy/codegena/commit/21e3e0eefc521efb74a3df03ab6725ac80d3e9b7))
* prevent of generating redundant part of `allOf` ([c4c35a9](https://github.com/koshevy/codegena/commit/c4c35a970fd455dce9e03f3d44689386ffa8cf0b)), closes [/github.com/koshevy/codegena/commit/945bc220dcefa92bfe02875dc747cee4a810cc23#diff-bd76ab89111c673f21c3544e47f7bb70R11](https://github.com//github.com/koshevy/codegena/commit/945bc220dcefa92bfe02875dc747cee4a810cc23/issues/diff-bd76ab89111c673f21c3544e47f7bb70R11)
