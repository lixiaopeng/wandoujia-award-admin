/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 18:29:11
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-23 15:40:49
*/


module.exports = function (grunt) {

    // require('time-grunt')(grunt);

    // load all grunt tasks
    // require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-parallel');
    // grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-supervisor');
    grunt.loadNpmTasks('grunt-contrib-compass');

    grunt.initConfig({

        supervisor: {
            target: {
                script: './bin/www',
                options: {
                    // exec: 'node',
                    // forceSync: true
                }
            }
        },

        compass : {
            server: {
                options: {
                    sassDir: 'app/src/stylesheets',
                    cssDir: 'app/public/css'
                }
            }
        },

        clean : {
            // dist : ['<%= paths.app %>/css', '<%= paths.app %>/js'],
            server : {
                src : ['app/public/css', 'app/public/img', 'app/public/js']
            }
        },

        copy : {
            server : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : 'app/src/images',
                    dest : 'app/public/img',
                    src : [
                        '**/*.*'
                    ]
                }]
            },
        },

        watch: {
            frontend: {
                options: {
                    livereload: true
                },
                files: [
                    'app/public/css/*.css',
                    'app/public/img/**/*',
                    'app/views/*.jade',
                ],
                // tasks: [
                //     'clean:server',
                //     'copy:server',
                // ]
            },
            stylesSass: {
                files: [
                    'app/src/stylesheets/*.scss'
                ],
                tasks: [
                    'compass:server'
                ]
            },
            web: {
                files: [
                    'app/routes/*.js',
                    'app.js'
                ],
                tasks: [
                    // 'express:web'
                    'supervisor:target'
                ],
                options: {
                    nospawn: true, //Without this option specified express won't be reloaded
                    atBegin: true,
                }
            }
        },

        parallel: {
            web: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['watch:frontend']
                }, {
                    grunt: true,
                    args: ['watch:stylesSass']
                }, {
                    grunt: true,
                    args: ['watch:web']
                }]
            },
        },
    });

    grunt.registerTask('web', 'launch webserver and watch tasks', [
        'clean:server',
        'copy:server',
        'compass:server',
        'parallel:web'
    ]);


    grunt.registerTask('default', ['web']);
};
