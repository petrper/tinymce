var p = Ent.Project.create('darwin', 'js');
p.setVersion(1, 2, 1);
p.setBolt('library', '**/*.js');
p.setBoltTest();

