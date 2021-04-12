var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

let a = {
  savedNode: {
    type: "2",
    objectType: "0",
    node: {
      uuid: "{6d3d80c7-1350-47f3-8d6e-88d1adce480f}",
      name: "Редуктор НКД",
      type: "2",
      objectType: "0",
      group: {
        name: "schema",
        param: { value: "NODATA", name: "picture_DATA_base64" },
      },
      node: {
        uuid: "{4dfafc27-cb3e-40c0-9a0b-18bab82121c9}",
        name: "Первая ступень",
        type: "3",
        objectType: "3",
        group: [
          {
            name: "freq_options",
            param: [
              { value: "10", name: "low" },
              { value: "200", name: "high" },
            ],
          },
          { name: "comment", param: { value: "", name: "comment" } },
          {
            name: "object_options",
            param: [
              { value: "17", name: "z1" },
              { value: "37", name: "z2" },
            ],
          },
        ],
        node: [
          {
            uuid: "{f109a595-6410-4304-9a80-22a1a5ea5893}",
            name: "22322CC",
            type: "3",
            objectType: "9",
            group: [
              {
                name: "freq_options",
                param: [
                  { value: "10", name: "low" },
                  { value: "200", name: "high" },
                ],
              },
              { name: "comment", param: { value: "", name: "comment" } },
              {
                name: "object_options",
                param: [
                  { value: "22322CC", name: "name" },
                  { value: "SKF", name: "vendor" },
                  { value: "240.00", name: "outerD" },
                  { value: "110.00", name: "internalD" },
                  { value: "32.00", name: "rollerD" },
                  { value: "15", name: "rollcount" },
                  { value: "12.83", name: "angle" },
                ],
              },
            ],
          },
          {
            uuid: "{b9d6e0ea-8d71-4df7-9fda-3b96c6a49bbf}",
            name: "31320X",
            type: "3",
            objectType: "9",
            group: [
              {
                name: "freq_options",
                param: [
                  { value: "10", name: "low" },
                  { value: "200", name: "high" },
                ],
              },
              { name: "comment", param: { value: "", name: "comment" } },
              {
                name: "object_options",
                param: [
                  { value: "31320X", name: "name" },
                  { value: "SKF", name: "vendor" },
                  { value: "215.00", name: "outerD" },
                  { value: "100.00", name: "internalD" },
                  { value: "28.30", name: "rollerD" },
                  { value: "16", name: "rollcount" },
                  { value: "28.81", name: "angle" },
                ],
              },
            ],
          },
          {
            uuid: "{99d715f3-98fc-43fb-9713-e389d9f2a5bc}",
            name: "30230",
            type: "3",
            objectType: "7",
            group: [
              {
                name: "freq_options",
                param: [
                  { value: "10", name: "low" },
                  { value: "200", name: "high" },
                ],
              },
              { name: "comment", param: { value: "", name: "comment" } },
              {
                name: "object_options",
                param: [
                  { value: "30230", name: "name" },
                  { value: "SKF", name: "vendor" },
                  { value: "270.00", name: "outerD" },
                  { value: "150.00", name: "internalD" },
                  { value: "29.82", name: "rollerD" },
                  { value: "18", name: "rollcount" },
                  { value: "16.17", name: "angle" },
                ],
              },
            ],
          },
          {
            uuid: "{254ed2c7-c0ab-4c49-8fd0-86813fc7b01d}",
            name: "Вторая ступень",
            type: "3",
            objectType: "12",
            group: [
              {
                name: "freq_options",
                param: [
                  { value: "10", name: "low" },
                  { value: "200", name: "high" },
                ],
              },
              { name: "comment", param: { value: "", name: "comment" } },
              {
                name: "object_options",
                param: [
                  { value: "23", name: "z1" },
                  { value: "41", name: "z2" },
                  { value: "103", name: "z3" },
                  { value: "3", name: "n" },
                ],
              },
            ],
            node: [
              {
                uuid: "{cad95252-aa93-408b-a640-227f98c823ad}",
                name: "22217CC",
                type: "3",
                objectType: "15",
                group: [
                  {
                    name: "freq_options",
                    param: [
                      { value: "10", name: "low" },
                      { value: "200", name: "high" },
                    ],
                  },
                  { name: "comment", param: { value: "", name: "comment" } },
                  {
                    name: "object_options",
                    param: [
                      { value: "22217CC", name: "name" },
                      { value: "SKF", name: "vendor" },
                      { value: "150.00", name: "outerD" },
                      { value: "85.00", name: "internalD" },
                      { value: "16.00", name: "rollerD" },
                      { value: "19", name: "rollcount" },
                      { value: "8.5", name: "angle" },
                    ],
                  },
                ],
              },
              {
                uuid: "{0818f0ac-847d-43c2-a6f9-fb05d7656969}",
                name: "Третья ступень",
                type: "3",
                objectType: "12",
                group: [
                  {
                    name: "freq_options",
                    param: [
                      { value: "10", name: "low" },
                      { value: "200", name: "high" },
                    ],
                  },
                  { name: "comment", param: { value: "", name: "comment" } },
                  {
                    name: "object_options",
                    param: [
                      { value: "23", name: "z1" },
                      { value: "35", name: "z2" },
                      { value: "91", name: "z3" },
                      { value: "3", name: "n" },
                    ],
                  },
                ],
                node: [
                  {
                    uuid: "{261d672f-1625-4759-b9da-08c039570b74}",
                    name: "22224CC",
                    type: "3",
                    objectType: "15",
                    group: [
                      {
                        name: "freq_options",
                        param: [
                          { value: "10", name: "low" },
                          { value: "200", name: "high" },
                        ],
                      },
                      {
                        name: "comment",
                        param: { value: "", name: "comment" },
                      },
                      {
                        name: "object_options",
                        param: [
                          { value: "22224CC", name: "name" },
                          { value: "SKF", name: "vendor" },
                          { value: "215.00", name: "outerD" },
                          { value: "120.00", name: "internalD" },
                          { value: "23.50", name: "rollerD" },
                          { value: "19", name: "rollcount" },
                          { value: "9.58", name: "angle" },
                        ],
                      },
                    ],
                  },
                  {
                    uuid: "{9afcd1fa-3085-45fd-a548-9478e1686809}",
                    name: "61860MA",
                    type: "3",
                    objectType: "7",
                    group: [
                      {
                        name: "freq_options",
                        param: [
                          { value: "10", name: "low" },
                          { value: "200", name: "high" },
                        ],
                      },
                      {
                        name: "comment",
                        param: { value: "", name: "comment" },
                      },
                      {
                        name: "object_options",
                        param: [
                          { value: "61860MA", name: "name" },
                          { value: "SKF", name: "vendor" },
                          { value: "380.00", name: "outerD" },
                          { value: "300.00", name: "internalD" },
                          { value: "23.81", name: "rollerD" },
                          { value: "25", name: "rollcount" },
                          { value: "0", name: "angle" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            uuid: "{6e665fe4-3d53-4d19-bbee-f80a023677f4}",
            name: "Измерение_1",
            type: "4",
            objectType: "0",
            group: {
              name: "comment",
              param: {
                value:
                  "Fвр = 16,66Гц\nПонижение в 2.176\nF2 = 7.659\nПонижение в 5,478\nF3 = 1.398\nПонижение в 4,956 раз\nF4 = 0,282\n",
                name: "comment",
              },
            },
          },
        ],
      },
    },
  },
  signals: [
    {
      name: "Тахосигнал",
      target_id: "tacho",
      device_type: "d001",
      device_id: "0",
      channel: "0",
    },
    {
      name: "Датчик вибрации на I ступени",
      target_id: "sensor1",
      device_type: "d001",
      device_id: "0",
      channel: "1",
    },
    {
      name: "Датчик вибрации на II ступени",
      target_id: "sensor2",
      device_type: "d001",
      device_id: "0",
      channel: "2",
    },
    {
      name: "Датчик вибрации на III ступени",
      target_id: "sensor3",
      device_type: "d001",
      device_id: "0",
      channel: "3",
    },
  ],
};
module.exports = router;
