class CreateMaterials < ActiveRecord::Migration
  def change
    create_table :materials do |t|
    	t.integer :order_id
    	t.integer :plant_id
    	t.string :name
    	t.decimal :quantity, :precision => 12, :scale => 4
    	t.string :units
      t.timestamps
    end
    add_index :materials, [:name, :order_id], :unique => true
    add_index :materials, [:plant_id, :name], :unique => true
  end
end
