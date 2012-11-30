class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
    	t.string :name
    	t.integer :level	
      t.timestamps
    end
    add_index :users, :name
  end
end
