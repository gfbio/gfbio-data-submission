/**
 * This is just a fixture to mock enaWidget.js or javascript in general
 */
(function () {
    'use strict';

    angular
        .module('enaWidget.submission')
        .controller('SubmissionCtrl', SubmissionCtrl);

    SubmissionCtrl.$inject = ['$http', 'localStorageService', 'studyConfig', 'sampleConfig', 'experimentConfig',
        'runConfig', 'submissionUrl'];

    function SubmissionCtrl($http, localStorageService, studyConfig, sampleConfig, experimentConfig,
                            runConfig, submissionUrl) {
        // works with controllerAs in routes
        var vm = this;
        vm.submitButtonHandler = submitButtonHandler;
        vm.wsResponse = {
            data: '',
            status: '',
            headers: '',
            config: '',
            available: false,
            css_style: ''
        };

        /////////////////////////////////////

        function attachGcdjson(samples) {
            for (var i in samples) {
                if (samples[i].hasOwnProperty('gcdjson_key')) {
                    samples[i].gcdjson = localStorageService.get(samples[i].gcdjson_key);
                    // this here works, but after deletion cached gcdj is no longer associated with sample
                    // TODO: take care of this, either remove everything after submit or deal with extra props in WS
                    //delete samples[i].gcdjson_key;

                    // FIXME; hardcoding this makes request fail !?
                    samples[i].gcdjson.gcdj_version = '0.0.0';

                }
            }
        }

        //////////////////////////////////


        //////////////////////////////////

        function submitButtonHandler() {
            var study_data = localStorageService.get(studyConfig.id);
            var sample_data = localStorageService.get(sampleConfig.id);
            var experiment_data = localStorageService.get(experimentConfig.id);
            var run_data = localStorageService.get(runConfig.id);

            if (study_data !== undefined && sample_data !== undefined) {
                attachGcdjson(sample_data.samples);
                //console.log('Samples -----------');
                //console.log(sample_data.samples);

                // TODO: change url and put into service // JSON.stringify({sample: sample_data, study: study_data})
                // FIXME: success and

                // TODO: check ngresource

                // TODO: find way of configuring this
                // TODO: username:password -> base64
                // Works when cors whitelisting
                //var req = {
                //    method: 'POST',
                //    url: 'http://127.0.0.1:8000/brokerage/ena/authtestview/',
                //    useXDomain: true,
                //    withCredentials: true,
                //    headers: {
                //        'Authorization': 'Basic bWF3ZWJlcjp0ZXN0',
                //        'Content-Type': 'application/x-www-form-urlencoded'
                //    },
                //    transformRequest: function (obj) {
                //        var str = [];
                //        for (var p in obj)
                //            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                //        return str.join("&");
                //    },
                //    // TODO: think of EXTRA endpoint for widgte submission using schemavalidation instead of form validation
                //    data: {
                //        submitting_user: 'pollo',
                //        site_project_id: 'prj001',
                //        study: JSON.stringify(study_data),
                //        sample: JSON.stringify(sample_data),
                //        experiment: JSON.stringify(experiment_data),
                //        run: JSON.stringify(run_data)
                //    }
                //};

                // No Auth: Valid post for SubmissionForm validation
                //var req = {
                //    method: 'POST',
                //    url: 'http://127.0.0.1:8000/brokerage/ena/testview/',
                //    headers: {
                //        'Content-Type': 'application/x-www-form-urlencoded'
                //    },
                //    transformRequest: function (obj) {
                //        var str = [];
                //        for (var p in obj)
                //            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                //        return str.join("&");
                //    },
                //    // TODO: think of EXTRA endpoint for widgte submission using schemavalidation instead of form validation
                //    data: {
                //        submitting_user: 'pollo',
                //        site_project_id: 'prj001',
                //        study: JSON.stringify(study_data),
                //        sample: JSON.stringify(sample_data),
                //        experiment: JSON.stringify(experiment_data),
                //        run: JSON.stringify(run_data)
                //    }
                //};
                //console.log('study_daty type '+typeof study_data);
                var req = {
                    method: 'POST',
                    url: 'http://127.0.0.1:8000/brokerage/ena/submit/',
                    //useXDomain: true,
                    //withCredentials: true,
                    headers: {
                        'Authorization': 'Token 38045eb1c239f3b1a85b1aa97b7b1e646f3bcd66'
                    },
                    //transformRequest: function (obj) {
                    //    var str = [];
                    //    for (var p in obj)
                    //        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    //    return str.join("&");
                    //},
                    data: {
                        submitting_user: 'pollo',
                        site_project_id: 'prj001',
                        study: study_data,
                        sample: sample_data,
                        experiment: experiment_data,
                        run: run_data
                    }
                };
                $http(req).

                    // NO Auth like before FAILS
                    //$http.post('http://127.0.0.1:8000/brokerage/ena/testview/', {sample: sample_data, study: study_data, experiment: experiment_data, run: run_data}).


                    success(function (data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                        vm.wsResponse.data = data;
                        vm.wsResponse.status = status;
                        vm.wsResponse.headers = headers;
                        vm.wsResponse.config = config;
                        vm.wsResponse.available = true;
                        vm.wsResponse.css_style = 'bs-callout-info';
                    }).
                    error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        vm.wsResponse.data = data;
                        vm.wsResponse.status = status;
                        vm.wsResponse.headers = headers;
                        vm.wsResponse.config = config;
                        vm.wsResponse.available = true;
                        vm.wsResponse.css_style = 'bs-callout-danger';
                    });

                //var req = {
                //    method: 'POST',
                //    url: 'http://127.0.0.1:8000/brokerage/ena/testview/',
                //    headers: {
                //        'Content-Type': 'application/x-www-form-urlencoded'
                //    },
                //    transformRequest: function (obj) {
                //        var str = [];
                //        for (var p in obj)
                //            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                //        return str.join("&");
                //    },
                //    // TODO: think of EXTRA endpoint for widgte submission using schemavalidation instead of form validation
                //    data: {
                //        submitting_user: 'pollo',
                //        site_project_id: 'prj001',
                //        study: JSON.stringify(study_data),
                //        sample: JSON.stringify(sample_data),
                //        experiment: JSON.stringify(experiment_data),
                //        run: JSON.stringify(run_data)
                //    }
                //};
                //$http(req).
                //    success(function (data, status, headers, config) {
                //        // this callback will be called asynchronously
                //        // when the response is available
                //    }).
                //    error(function (data, status, headers, config) {
                //        // called asynchronously if an error occurs
                //        // or server returns response with an error status.
                //    });
            }
        }
    }

})();
